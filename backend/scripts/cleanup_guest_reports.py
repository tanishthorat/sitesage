#!/usr/bin/env python3
"""
Standalone script for cleaning up guest reports.

This script can be run as a cron job to automatically clean up
ephemeral guest reports older than the retention period.

Usage:
    python cleanup_guest_reports.py [--retention-hours HOURS] [--dry-run]

Examples:
    # Clean up reports older than 24 hours (default)
    python cleanup_guest_reports.py
    
    # Clean up reports older than 48 hours
    python cleanup_guest_reports.py --retention-hours 48
    
    # Dry run (only show what would be deleted)
    python cleanup_guest_reports.py --dry-run
    
Cron Job Examples:
    # Run daily at 2 AM
    0 2 * * * cd /app/backend && python scripts/cleanup_guest_reports.py
    
    # Run every 6 hours
    0 */6 * * * cd /app/backend && python scripts/cleanup_guest_reports.py
"""

import sys
import argparse
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.cleanup import cleanup_guest_reports_standalone
from app.logger import logger


def main():
    parser = argparse.ArgumentParser(
        description="Clean up ephemeral guest reports from the database"
    )
    parser.add_argument(
        "--retention-hours",
        type=int,
        default=24,
        help="Hours to keep guest reports (default: 24)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Only show what would be deleted without actually deleting"
    )
    
    args = parser.parse_args()
    
    logger.info("=" * 60)
    logger.info("Guest Report Cleanup Script")
    logger.info(f"Retention Period: {args.retention_hours} hours")
    logger.info(f"Dry Run: {args.dry_run}")
    logger.info("=" * 60)
    
    try:
        result = cleanup_guest_reports_standalone(
            retention_hours=args.retention_hours,
            dry_run=args.dry_run
        )
        
        logger.info("-" * 60)
        logger.info(f"Result: {result}")
        logger.info("-" * 60)
        
        if args.dry_run:
            print(f"\n✓ DRY RUN: Would delete {result['deleted_count']} guest reports")
        else:
            print(f"\n✓ Successfully deleted {result['deleted_count']} guest reports")
        
        return 0
        
    except Exception as e:
        logger.error(f"Cleanup failed: {e}")
        print(f"\n✗ Error: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
