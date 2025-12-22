"""
SEO Analyzer Orchestrator Service.

This service orchestrates the entire SEO analysis workflow:
- URL crawling
- AI analysis
- Report creation
- Background tasks
"""

from typing import Dict, Optional
from sqlalchemy.orm import Session
from fastapi import BackgroundTasks

from .. import models, schemas
from ..logger import logger
from ..exceptions import CrawlerException, DatabaseException
from .crawler import crawl_website
from .ai_agent import analyze_with_ai
from .pagespeed import fetch_lighthouse_metrics_safe


async def analyze_url_service(
    url: str,
    user: Optional[models.User],
    db: Session,
    background_tasks: BackgroundTasks
) -> models.Report:
    """
    Orchestrate the complete SEO analysis workflow.
    
    SNAPSHOT ARCHITECTURE:
    - Every request creates a NEW report (no cooldown checks)
    - Each analysis is a distinct snapshot in time
    - Authenticated users: Reports are linked to their account
    - Guest users: Reports are saved with NULL user_id
    
    Args:
        url: The URL to analyze
        user: Optional authenticated user (None for guests)
        db: Database session
        background_tasks: FastAPI background tasks manager
        
    Returns:
        Complete SEO analysis report
        
    Raises:
        CrawlerException: If crawling fails
        DatabaseException: If database operations fail
    """
    user_context = user.email if user else "Guest"
    logger.info(f"Starting analysis for URL: {url} by {user_context}")
    
    # Step 1: Crawl the website
    try:
        crawl_data = await crawl_website(url)
        logger.info(f"Crawling completed for {url}: Score {crawl_data['seo_score']}")
    except CrawlerException as e:
        logger.error(f"Crawler failed for {url}: {e.message}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during crawling: {e}")
        raise CrawlerException(f"Failed to analyze URL: {str(e)}")
    
    # Step 2: Run AI analysis
    try:
        ai_result = analyze_with_ai(crawl_data)
        logger.info(f"AI analysis completed for {url}")
    except Exception as e:
        logger.error(f"AI analysis failed: {e}")
        # Don't fail the entire request if AI fails
        ai_result = {
            "summary": "AI analysis temporarily unavailable",
            "suggestions": ["Please try again later"]
        }
    
    # Step 3: Process AI suggestions
    processed_suggestions = _process_ai_suggestions(ai_result.get('suggestions', []))
    
    # Step 4: Create and save report
    try:
        report = _create_report(
            url=url,
            user_id=user.id if user else None,
            crawl_data=crawl_data,
            ai_result=ai_result,
            processed_suggestions=processed_suggestions,
            db=db
        )
        logger.info(f"Report saved to database with ID: {report.id}")
    except Exception as e:
        logger.error(f"Database error while saving report: {e}")
        db.rollback()
        raise DatabaseException("Failed to save analysis report")
    
    # Step 5: Schedule background Lighthouse fetch
    background_tasks.add_task(
        fetch_and_update_lighthouse,
        report.id,
        url
    )
    
    return report


def _process_ai_suggestions(suggestions: list) -> list:
    """
    Process AI suggestions, converting objects to strings if needed.
    
    Args:
        suggestions: Raw AI suggestions (may be strings or dicts)
        
    Returns:
        List of processed suggestion strings
    """
    processed = []
    for suggestion in suggestions:
        if isinstance(suggestion, dict):
            # Convert object format to string
            title = suggestion.get('title', '')
            description = suggestion.get('description', '')
            processed.append(f"{title}: {description}" if title else description)
        else:
            # Already a string
            processed.append(str(suggestion))
    return processed


def _create_report(
    url: str,
    user_id: Optional[int],
    crawl_data: Dict,
    ai_result: Dict,
    processed_suggestions: list,
    db: Session
) -> models.Report:
    """
    Create and persist SEO analysis report.
    
    Args:
        url: Analyzed URL
        user_id: User ID (None for guests)
        crawl_data: Crawling results
        ai_result: AI analysis results
        processed_suggestions: Processed AI suggestions
        db: Database session
        
    Returns:
        Created report instance
    """
    report = models.Report(
        url=url,
        user_id=user_id,  # NULL for guests
        title=crawl_data['title'],
        meta_description=crawl_data['meta_description'],
        h1_count=crawl_data['h1_count'],
        h2_count=crawl_data['h2_count'],
        image_count=crawl_data['image_count'],
        missing_alt_count=crawl_data['missing_alt_count'],
        # Pro SEO Metrics
        word_count=crawl_data.get('word_count', 0),
        internal_links_count=crawl_data.get('internal_links_count', 0),
        external_links_count=crawl_data.get('external_links_count', 0),
        canonical_url=crawl_data.get('canonical_url'),
        og_tags_present=crawl_data.get('og_tags_present', False),
        schema_present=crawl_data.get('schema_present', False),
        robots_txt_exists=crawl_data.get('robots_txt_exists', False),
        sitemap_exists=crawl_data.get('sitemap_exists', False),
        top_keywords=crawl_data.get('top_keywords', []),
        # Performance & AI
        load_time=crawl_data['load_time'],
        seo_score=crawl_data['seo_score'],
        ai_summary=ai_result.get('summary', 'AI Analysis Unavailable'),
        ai_suggestions=processed_suggestions
    )

    # Ensure the initial lighthouse status is 'pending'
    try:
        report.lighthouse_status = 'pending'
    except Exception:
        # In case the DB model does not have the field yet (prior to migration), ignore
        pass
    
    db.add(report)
    db.commit()
    db.refresh(report)
    
    return report


async def fetch_and_update_lighthouse(report_id: int, url: str):
    """
    Background task to fetch Lighthouse metrics and update report.
    
    This runs asynchronously after the main response is sent to the client.
    Lighthouse metrics can take 30-60 seconds to fetch.
    
    Args:
        report_id: Report ID to update
        url: URL to analyze
    """
    from ..database import SessionLocal
    
    # Create a new database session for this background task
    db = SessionLocal()
    try:
        logger.info(f"Fetching Lighthouse metrics for report {report_id}")
        metrics = await fetch_lighthouse_metrics_safe(url)
        
        # Update report with Lighthouse scores
        report = db.query(models.Report).filter(models.Report.id == report_id).first()
        if report:
            report.lighthouse_performance = metrics.get("performance")
            report.lighthouse_accessibility = metrics.get("accessibility")
            report.lighthouse_seo = metrics.get("seo")
            report.lighthouse_best_practices = metrics.get("best_practices")
            # mark status completed when metrics present
            try:
                report.lighthouse_status = 'completed'
            except Exception:
                pass
            db.commit()
            logger.info(f"Lighthouse metrics updated for report {report_id}")
        else:
            logger.warning(f"Report {report_id} not found for Lighthouse update")
    except Exception as e:
        logger.error(f"Failed to update Lighthouse metrics for report {report_id}: {e}")
        try:
            # mark failed if possible
            report = db.query(models.Report).filter(models.Report.id == report_id).first()
            if report:
                report.lighthouse_status = 'failed'
                db.commit()
        except Exception:
            db.rollback()
    finally:
        db.close()
