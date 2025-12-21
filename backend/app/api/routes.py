"""
API Routes - All application endpoints.

This module contains all API route handlers, delegating business logic
to service layer functions.
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func, text
from typing import Optional

from .. import models, schemas
from ..core.dependencies import (
    get_database,
    get_authenticated_user,
    get_optional_authenticated_user,
    verify_api_key
)
from ..config import settings
from ..logger import logger
from ..exceptions import DatabaseException
from ..services.analyzer import analyze_url_service
from ..services.cleanup import cleanup_guest_reports, get_guest_report_stats


# Create API router
router = APIRouter()


# ============================================================================
# Status Endpoints
# ============================================================================

@router.get("/", tags=["Status"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "running",
        "environment": settings.ENVIRONMENT,
        "docs": "/docs"
    }


@router.get("/health", tags=["Status"])
async def health_check(db: Session = Depends(get_database)):
    """Health check endpoint with database connectivity check."""
    try:
        # Test database connection
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


# ============================================================================
# SEO Analysis Endpoints
# ============================================================================

@router.post(
    f"{settings.API_V1_PREFIX}/analyze",
    response_model=schemas.ReportResponse,
    tags=["SEO Analysis"],
    status_code=status.HTTP_201_CREATED
)
async def analyze_url(
    request: schemas.ReportCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_database),
    current_user: Optional[models.User] = Depends(get_optional_authenticated_user),
    _: bool = Depends(verify_api_key)
):
    """
    Analyze a website URL for SEO performance.
    
    Supports both authenticated users and guests.
    
    SNAPSHOT ARCHITECTURE:
    - Every request creates a NEW report (no cooldown checks)
    - Each analysis is a distinct snapshot in time
    - Authenticated users: Reports are linked to their account
    - Guest users: Reports are saved with NULL user_id
    
    Features:
    - Crawls the provided URL
    - Extracts SEO metrics (title, meta tags, headings, images)
    - Calculates an SEO score
    - Generates AI-powered insights and suggestions
    - Fetches Lighthouse metrics in the background
    
    Returns:
        Complete SEO analysis report (Lighthouse metrics populated asynchronously)
    """
    return await analyze_url_service(
        url=str(request.url),
        user=current_user,
        db=db,
        background_tasks=background_tasks
    )


# ============================================================================
# Reports Endpoints
# ============================================================================

@router.get(
    f"{settings.API_V1_PREFIX}/reports",
    response_model=list[schemas.ReportResponse],
    tags=["Reports"]
)
async def get_reports(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_database),
    current_user: models.User = Depends(get_authenticated_user),
    _: bool = Depends(verify_api_key)
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


@router.get(
    f"{settings.API_V1_PREFIX}/reports/{{report_id}}",
    response_model=schemas.ReportResponse,
    tags=["Reports"]
)
async def get_report(
    report_id: int,
    db: Session = Depends(get_database),
    current_user: Optional[models.User] = Depends(get_optional_authenticated_user),
    _: bool = Depends(verify_api_key)
):
    """
    Retrieve a specific SEO analysis report by ID.
    
    Supports guest and authenticated access.
    
    ACCESS CONTROL:
    - Guest reports (user_id = NULL): Accessible by anyone (for polling Lighthouse updates)
    - User reports (user_id != NULL): Only accessible by the owner
    
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
        logger.info(f"Report {report_id} access granted to {user_context}")
        return report
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error while fetching report {report_id}: {e}")
        raise DatabaseException("Failed to retrieve report")


# ============================================================================
# History Endpoints
# ============================================================================

@router.get(
    f"{settings.API_V1_PREFIX}/history/unique",
    response_model=list[schemas.HistoryURLResponse],
    tags=["History"]
)
async def get_unique_urls(
    db: Session = Depends(get_database),
    current_user: models.User = Depends(get_authenticated_user),
    _: bool = Depends(verify_api_key)
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


def _normalize_url(url: str) -> str:
    """
    Normalize URL by ensuring consistent trailing slash handling.
    Tries to match the URL as-is first, then with/without trailing slash.
    """
    return url.rstrip('/')


async def _get_reports_for_url(
    url: str,
    current_user: models.User,
    db: Session
) -> list[models.Report]:
    """
    Helper function to fetch reports for a URL with flexible matching.
    Handles trailing slash variations.
    """
    # Try exact match first
    reports = db.query(models.Report).filter(
        models.Report.user_id == current_user.id,
        models.Report.url == url
    ).order_by(
        models.Report.created_at.desc()
    ).all()
    
    # If no exact match, try with/without trailing slash
    if not reports:
        normalized_url = _normalize_url(url)
        # Try normalized URL
        reports = db.query(models.Report).filter(
            models.Report.user_id == current_user.id,
            models.Report.url == normalized_url
        ).all()
        
        # If still not found, try with trailing slash added
        if not reports:
            reports = db.query(models.Report).filter(
                models.Report.user_id == current_user.id,
                models.Report.url == f"{normalized_url}/"
            ).order_by(
                models.Report.created_at.desc()
            ).all()
    
    return reports


@router.get(
    f"{settings.API_V1_PREFIX}/history/by-url",
    response_model=list[schemas.ReportResponse],
    tags=["History"]
)
async def get_url_history(
    url: str,
    db: Session = Depends(get_database),
    current_user: models.User = Depends(get_authenticated_user),
    _: bool = Depends(verify_api_key)
):
    """
    Get all reports for a specific URL by the current user.
    
    Shows the progression of SEO scores over time for that URL.
    
    Args:
        url: The URL to retrieve history for (query parameter, e.g., ?url=https://example.com)
        
    Returns:
        List of all reports for the specified URL
        
    Example:
        GET /api/v1/history/by-url?url=https://example.com
    """
    logger.info(f"Fetching history for URL: {url} by user {current_user.email}")
    
    try:
        reports = await _get_reports_for_url(url, current_user, db)
        
        if not reports:
            logger.warning(f"No reports found for URL: {url}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No reports found for URL: {url}"
            )
        
        logger.info(f"Found {len(reports)} reports for URL: {url}")
        return reports
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error while fetching URL history: {e}")
        raise DatabaseException("Failed to retrieve URL history")


@router.get(
    f"{settings.API_V1_PREFIX}/history/{{url:path}}",
    response_model=list[schemas.ReportResponse],
    tags=["History"],
    deprecated=True
)
async def get_url_history_legacy(
    url: str,
    db: Session = Depends(get_database),
    current_user: models.User = Depends(get_authenticated_user),
    _: bool = Depends(verify_api_key)
):
    """
    DEPRECATED: Get all reports for a specific URL by the current user (legacy path parameter endpoint).
    
    Use /history/by-url?url=... instead.
    
    This endpoint exists for backward compatibility with older frontend versions.
    """
    logger.warning(f"Using deprecated path parameter endpoint for URL: {url}")
    return await get_url_history(url, db, current_user, _)


# ============================================================================
# Admin/Maintenance Endpoints
# ============================================================================

@router.post(
    f"{settings.API_V1_PREFIX}/admin/cleanup-guest-reports",
    tags=["Admin"],
    status_code=status.HTTP_200_OK
)
async def cleanup_guest_reports_endpoint(
    retention_hours: Optional[int] = None,
    dry_run: bool = False,
    db: Session = Depends(get_database),
    _: bool = Depends(verify_api_key)
):
    """
    Clean up guest reports older than retention period.
    
    EPHEMERAL STORAGE POLICY:
    - Guest reports (user_id = NULL) are temporary
    - Automatically cleaned after retention period
    - Default: 24 hours (configurable via environment)
    
    Args:
        retention_hours: Hours to keep guest reports (default: from config)
        dry_run: If True, only count without deleting (default: False)
        
    Returns:
        Cleanup statistics
    """
    # Use config value if not specified
    retention = retention_hours if retention_hours is not None else settings.GUEST_REPORT_RETENTION_HOURS
    
    logger.info(f"Starting guest report cleanup (retention: {retention}h, dry_run: {dry_run})")
    
    try:
        # Get stats before cleanup
        stats_before = get_guest_report_stats(db)
        
        # Perform cleanup
        cleanup_result = cleanup_guest_reports(db, retention, dry_run)
        
        # Get stats after cleanup
        stats_after = get_guest_report_stats(db)
        
        return {
            "success": True,
            "cleanup": cleanup_result,
            "stats_before": stats_before,
            "stats_after": stats_after
        }
        
    except Exception as e:
        logger.error(f"Failed to cleanup guest reports: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cleanup failed: {str(e)}"
        )


@router.get(
    f"{settings.API_V1_PREFIX}/admin/guest-report-stats",
    tags=["Admin"]
)
async def get_guest_report_stats_endpoint(
    db: Session = Depends(get_database),
    _: bool = Depends(verify_api_key)
):
    """
    Get statistics about guest reports for monitoring.
    
    Returns:
        Statistics including total count and oldest report age
    """
    try:
        stats = get_guest_report_stats(db)
        return {"success": True, "stats": stats}
    except Exception as e:
        logger.error(f"Failed to get guest report stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get stats: {str(e)}"
        )
