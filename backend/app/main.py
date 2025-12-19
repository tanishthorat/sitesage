from fastapi import FastAPI, Depends, HTTPException, Request, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func, text
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from typing import Optional
import logging

from . import models, schemas, database
from .services import crawler
from .services.ai_agent import analyze_with_ai
from .services.pagespeed import fetch_lighthouse_metrics_safe
from .firebase_auth import initialize_firebase, get_current_user, get_optional_user
from .config import settings
from .logger import logger
from .exceptions import SiteSageException, CrawlerException, AIAnalysisException, DatabaseException
from .middleware.rate_limit import RateLimitMiddleware

# Application lifespan handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events"""
    # Startup
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    
    # Initialize Firebase
    try:
        initialize_firebase()
        logger.info("Firebase initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}")
        # Continue without Firebase if serviceAccountKey.json is missing
    
    # Initialize database tables (for development)
    # In production, use Alembic migrations
    if settings.ENVIRONMENT == "development":
        database.init_db()
        logger.info("Database tables initialized")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application")

# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimitMiddleware)

# Exception handlers
@app.exception_handler(SiteSageException)
async def sitesage_exception_handler(request: Request, exc: SiteSageException):
    """Handle custom SiteSage exceptions"""
    logger.error(f"SiteSage error: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.message, "type": exc.__class__.__name__}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    logger.warning(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": "Validation failed", "details": exc.errors()}
    )

@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(request: Request, exc: SQLAlchemyError):
    """Handle database errors"""
    logger.error(f"Database error: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "Database operation failed"}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    logger.exception(f"Unexpected error: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "Internal server error"}
    )

# Health and status endpoints
@app.get("/", tags=["Status"])
async def root():
    """Root endpoint with API information"""
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "running",
        "environment": settings.ENVIRONMENT,
        "docs": "/docs"
    }

@app.get("/health", tags=["Status"])
async def health_check(db: Session = Depends(database.get_db)):
    """Health check endpoint with database connectivity check"""
    try:
        # Test database connection (SQLAlchemy 2.0 requires text())
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "unhealthy"
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
        "version": settings.VERSION
    }

# Background task for Lighthouse metrics
async def fetch_and_update_lighthouse(report_id: int, url: str):
    """Background task to fetch Lighthouse metrics and update report"""
    # Create a new database session for this background task
    db = database.SessionLocal()
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
            db.commit()
            logger.info(f"Lighthouse metrics updated for report {report_id}")
        else:
            logger.warning(f"Report {report_id} not found for Lighthouse update")
    except Exception as e:
        logger.error(f"Failed to update Lighthouse metrics for report {report_id}: {e}")
        db.rollback()
    finally:
        db.close()

# API endpoints
@app.post(
    f"{settings.API_V1_PREFIX}/analyze",
    response_model=schemas.ReportResponse,
    tags=["SEO Analysis"],
    status_code=status.HTTP_201_CREATED
)
async def analyze_url(
    request: schemas.ReportCreate,
    background_tasks: BackgroundTasks,
    current_user: Optional[models.User] = Depends(get_optional_user),
    db: Session = Depends(database.get_db)
):
    """
    Analyze a website URL for SEO performance (Supports both authenticated users and guests).
    
    SNAPSHOT ARCHITECTURE:
    - Every request creates a NEW report (no cooldown checks)
    - Each analysis is a distinct snapshot in time
    - Authenticated users: Reports are linked to their account
    - Guest users: Reports are saved with NULL user_id
    
    This endpoint:
    - Accepts optional authentication (Authorization header)
    - Crawls the provided URL
    - Extracts SEO metrics (title, meta tags, headings, images)
    - Calculates an SEO score
    - Generates AI-powered insights and suggestions
    - Fetches Lighthouse metrics in the background (PageSpeed Insights)
    - Saves the report to the database (with or without user association)
    
    Returns:
        ReportResponse: Complete SEO analysis report (Lighthouse metrics populated asynchronously)
    """
    # Log request with user context
    user_context = current_user.email if current_user else "Guest"
    logger.info(f"Starting analysis for URL: {request.url} by {user_context}")
    
    try:
        # Run async crawler
        data = await crawler.crawl_website(str(request.url))
        logger.info(f"Crawling completed for {request.url}: Score {data['seo_score']}")
        
    except CrawlerException as e:
        logger.error(f"Crawler failed for {request.url}: {e.message}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during crawling: {e}")
        raise CrawlerException(f"Failed to analyze URL: {str(e)}")
    
    try:
        # Run AI Analysis
        ai_result = analyze_with_ai(data)
        logger.info(f"AI analysis completed for {request.url}")
        
    except Exception as e:
        logger.error(f"AI analysis failed: {e}")
        # Don't fail the entire request if AI fails
        ai_result = {
            "summary": "AI analysis temporarily unavailable",
            "suggestions": ["Please try again later"]
        }
    
    try:
        # Process AI suggestions - convert objects to strings if needed
        suggestions = ai_result.get('suggestions', [])
        processed_suggestions = []
        for suggestion in suggestions:
            if isinstance(suggestion, dict):
                # Convert object format to string
                title = suggestion.get('title', '')
                description = suggestion.get('description', '')
                processed_suggestions.append(f"{title}: {description}" if title else description)
            else:
                # Already a string
                processed_suggestions.append(str(suggestion))
        
        # Save to DB (Snapshot Architecture - always create new report)
        # If authenticated: Link to user account, If guest: Save with NULL user_id
        db_report = models.Report(
            url=str(request.url),
            user_id=current_user.id if current_user else None,  # NULL for guests
            title=data['title'],
            meta_description=data['meta_description'],
            h1_count=data['h1_count'],
            h2_count=data['h2_count'],
            image_count=data['image_count'],
            missing_alt_count=data['missing_alt_count'],
            load_time=data['load_time'],
            seo_score=data['seo_score'],
            ai_summary=ai_result.get('summary', 'AI Analysis Unavailable'),
            ai_suggestions=processed_suggestions
        )
        
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        
        logger.info(f"Report saved to database with ID: {db_report.id}")
        
        # Fetch Lighthouse metrics in background (can take 30-60 seconds)
        background_tasks.add_task(
            fetch_and_update_lighthouse,
            db_report.id,
            str(request.url)
        )
        
        return db_report
        
    except SQLAlchemyError as e:
        logger.error(f"Database error while saving report: {e}")
        db.rollback()
        raise DatabaseException("Failed to save analysis report")

@app.get(
    f"{settings.API_V1_PREFIX}/reports",
    response_model=list[schemas.ReportResponse],
    tags=["Reports"]
)
async def get_reports(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Retrieve authenticated user's SEO analysis reports with pagination.
    
    Args:
        skip: Number of records to skip (default: 0)
        limit: Maximum number of records to return (default: 100, max: 100)
        
    Returns:
        List of SEO analysis reports for the current user
    """
    # Enforce maximum limit
    limit = min(limit, 100)
    
    logger.info(f"Fetching reports for user {current_user.email}: skip={skip}, limit={limit}")
    
    try:
        reports = db.query(models.Report)\
            .filter(models.Report.user_id == current_user.id)\
            .order_by(models.Report.created_at.desc())\
            .offset(skip)\
            .limit(limit)\
            .all()
        
        logger.info(f"Retrieved {len(reports)} reports for user {current_user.email}")
        return reports
        
    except SQLAlchemyError as e:
        logger.error(f"Database error while fetching reports: {e}")
        raise DatabaseException("Failed to retrieve reports")

@app.get(
    f"{settings.API_V1_PREFIX}/reports/{{report_id}}",
    response_model=schemas.ReportResponse,
    tags=["Reports"]
)
async def get_report(
    report_id: int,
    current_user: Optional[models.User] = Depends(get_optional_user),
    db: Session = Depends(database.get_db)
):
    """
    Retrieve a specific SEO analysis report by ID (supports guest and authenticated access).
    
    ACCESS CONTROL:
    - Guest reports (user_id = NULL): Accessible by anyone (for polling Lighthouse updates)
    - User reports (user_id != NULL): Only accessible by the owner
    
    This allows guests to poll their reports for Lighthouse metric updates without authentication.
    
    Args:
        report_id: The ID of the report to retrieve
        current_user: Optional authenticated user (None for guests)
        
    Returns:
        SEO analysis report
    """
    user_context = current_user.email if current_user else "Guest"
    logger.info(f"Fetching report {report_id} by {user_context}")
    
    try:
        # Fetch the report
        report = db.query(models.Report).filter(
            models.Report.id == report_id
        ).first()
        
        if not report:
            logger.warning(f"Report {report_id} not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Report with ID {report_id} not found"
            )
        
        # Access Control Logic
        if report.user_id is not None:
            # This is a USER-OWNED report - strict authentication required
            if not current_user:
                logger.warning(f"Unauthenticated access attempt to user report {report_id}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required to access this report"
                )
            
            if current_user.id != report.user_id:
                logger.warning(f"User {current_user.email} attempted to access report {report_id} owned by user {report.user_id}")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You don't have permission to access this report"
                )
        
        # If report.user_id is NULL (Guest Report), allow anyone to access
        # This enables guests to poll for Lighthouse updates
        logger.info(f"Report {report_id} access granted to {user_context}")
        return report
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error while fetching report {report_id}: {e}")
        raise DatabaseException("Failed to retrieve report")

# History endpoints
@app.get(
    f"{settings.API_V1_PREFIX}/history/unique",
    response_model=list[schemas.HistoryURLResponse],
    tags=["History"]
)
async def get_unique_urls(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Get list of unique URLs analyzed by the current user with metadata.
    Groups reports by URL and returns the most recent scan info for each.
    
    Returns:
        List of unique URLs with report count and latest scan info
    """
    logger.info(f"Fetching unique URLs for user {current_user.email}")
    
    try:
        # Query to group by URL and get latest scan info
        results = db.query(
            models.Report.url,
            func.count(models.Report.id).label('report_count'),
            func.max(models.Report.created_at).label('latest_scan'),
            func.max(models.Report.seo_score).label('latest_seo_score')
        ).filter(
            models.Report.user_id == current_user.id
        ).group_by(
            models.Report.url
        ).order_by(
            func.max(models.Report.created_at).desc()
        ).all()
        
        # Convert to response format
        history = [
            schemas.HistoryURLResponse(
                url=row.url,
                report_count=row.report_count,
                latest_scan=row.latest_scan,
                latest_seo_score=row.latest_seo_score
            )
            for row in results
        ]
        
        logger.info(f"Found {len(history)} unique URLs for user {current_user.email}")
        return history
        
    except SQLAlchemyError as e:
        logger.error(f"Database error while fetching history: {e}")
        raise DatabaseException("Failed to retrieve history")

@app.get(
    f"{settings.API_V1_PREFIX}/history/{{url:path}}",
    response_model=list[schemas.ReportResponse],
    tags=["History"]
)
async def get_url_history(
    url: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Get all reports for a specific URL by the current user.
    Shows the progression of SEO scores over time for that URL.
    
    Args:
        url: The URL to retrieve history for (full URL including protocol)
        
    Returns:
        List of all reports for the specified URL
    """
    logger.info(f"Fetching history for URL: {url} by user {current_user.email}")
    
    try:
        reports = db.query(models.Report).filter(
            models.Report.user_id == current_user.id,
            models.Report.url == url
        ).order_by(
            models.Report.created_at.desc()
        ).all()
        
        if not reports:
            logger.warning(f"No reports found for URL: {url}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No reports found for URL: {url}"
            )
        
        logger.info(f"Found {len(reports)} reports for URL: {url}")
        return reports
        
    except SQLAlchemyError as e:
        logger.error(f"Database error while fetching URL history: {e}")
        raise DatabaseException("Failed to retrieve URL history")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
