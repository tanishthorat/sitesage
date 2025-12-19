"""
Ephemeral Storage Cleanup for Guest Reports

This module provides cleanup functionality for guest user reports (user_id = NULL).
Guest reports are temporary and should be cleaned up after a retention period.

Usage:
    1. Manual: Call the endpoint /api/v1/admin/cleanup-guest-reports
    2. Scheduled: Run as a cron job (see deployment docs)
    3. Background: Configure in startup (see lifespan handler)
"""

from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timedelta
from typing import Dict
from ..database import SessionLocal
from ..models import Report
from ..logger import logger


def cleanup_guest_reports(
    db: Session,
    retention_hours: int = 24,
    dry_run: bool = False
) -> Dict[str, int]:
    """
    Clean up guest reports older than the retention period.
    
    Guest reports (user_id = NULL) are ephemeral and automatically cleaned
    to save database space and maintain performance.
    
    Args:
        db: Database session
        retention_hours: Hours to keep guest reports (default: 24)
        dry_run: If True, only count records without deleting
        
    Returns:
        Dict with 'deleted_count' and 'retention_hours'
    """
    try:
        cutoff_time = datetime.utcnow() - timedelta(hours=retention_hours)
        
        # Query to find guest reports older than cutoff
        old_guest_reports = db.query(Report).filter(
            Report.user_id.is_(None),
            Report.created_at < cutoff_time
        )
        
        # Count reports to be deleted
        count = old_guest_reports.count()
        
        if count == 0:
            logger.info("No guest reports to clean up")
            return {"deleted_count": 0, "retention_hours": retention_hours}
        
        if dry_run:
            logger.info(f"DRY RUN: Would delete {count} guest reports older than {retention_hours} hours")
            return {"deleted_count": count, "retention_hours": retention_hours, "dry_run": True}
        
        # Delete old guest reports
        deleted = old_guest_reports.delete(synchronize_session=False)
        db.commit()
        
        logger.info(
            f"Cleaned up {deleted} guest reports older than {retention_hours} hours "
            f"(cutoff: {cutoff_time.isoformat()})"
        )
        
        return {"deleted_count": deleted, "retention_hours": retention_hours}
        
    except Exception as e:
        logger.error(f"Error during guest report cleanup: {e}")
        db.rollback()
        raise


def cleanup_guest_reports_standalone(
    retention_hours: int = 24,
    dry_run: bool = False
) -> Dict[str, int]:
    """
    Standalone cleanup function for use in cron jobs or scripts.
    Creates its own database session.
    
    Args:
        retention_hours: Hours to keep guest reports (default: 24)
        dry_run: If True, only count records without deleting
        
    Returns:
        Dict with cleanup statistics
    """
    db = SessionLocal()
    try:
        return cleanup_guest_reports(db, retention_hours, dry_run)
    finally:
        db.close()


# SQL Query for direct database cleanup (alternative method)
CLEANUP_SQL = """
-- Delete guest reports older than specified interval
-- Usage: Replace '24 HOURS' with desired retention period
DELETE FROM reports 
WHERE user_id IS NULL 
AND created_at < NOW() - INTERVAL '24 HOURS';
"""


def get_guest_report_stats(db: Session) -> Dict:
    """
    Get statistics about guest reports for monitoring.
    
    Returns:
        Dict with total count and oldest report age
    """
    try:
        # Count guest reports
        total_guest_reports = db.query(Report).filter(
            Report.user_id.is_(None)
        ).count()
        
        # Get oldest guest report
        oldest_report = db.query(Report).filter(
            Report.user_id.is_(None)
        ).order_by(Report.created_at.asc()).first()
        
        stats = {
            "total_guest_reports": total_guest_reports,
            "oldest_report_age_hours": None
        }
        
        if oldest_report:
            age = datetime.utcnow() - oldest_report.created_at
            stats["oldest_report_age_hours"] = age.total_seconds() / 3600
        
        return stats
        
    except Exception as e:
        logger.error(f"Error getting guest report stats: {e}")
        return {"error": str(e)}
