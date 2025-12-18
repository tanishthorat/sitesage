from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from contextlib import asynccontextmanager
import logging

from . import models, schemas, database
from .services import crawler
from .services.ai_agent import analyze_with_ai
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
        # Test database connection
        db.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "unhealthy"
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
        "version": settings.VERSION
    }

# API endpoints
@app.post(
    f"{settings.API_V1_PREFIX}/analyze",
    response_model=schemas.ReportResponse,
    tags=["SEO Analysis"],
    status_code=status.HTTP_201_CREATED
)
async def analyze_url(
    request: schemas.ReportCreate,
    db: Session = Depends(database.get_db)
):
    """
    Analyze a website URL for SEO performance.
    
    This endpoint:
    - Crawls the provided URL
    - Extracts SEO metrics (title, meta tags, headings, images)
    - Calculates an SEO score
    - Generates AI-powered insights and suggestions
    - Saves the report to the database
    
    Returns:
        ReportResponse: Complete SEO analysis report
    """
    logger.info(f"Starting analysis for URL: {request.url}")
    
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
        # Save to DB
        db_report = models.Report(
            url=str(request.url),
            title=data['title'],
            meta_description=data['meta_description'],
            h1_count=data['h1_count'],
            h2_count=data['h2_count'],
            image_count=data['image_count'],
            missing_alt_count=data['missing_alt_count'],
            load_time=data['load_time'],
            seo_score=data['seo_score'],
            ai_summary=ai_result.get('summary', 'AI Analysis Unavailable'),
            ai_suggestions=ai_result.get('suggestions', [])
        )
        
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        
        logger.info(f"Report saved to database with ID: {db_report.id}")
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
    db: Session = Depends(database.get_db)
):
    """
    Retrieve SEO analysis reports with pagination.
    
    Args:
        skip: Number of records to skip (default: 0)
        limit: Maximum number of records to return (default: 100, max: 100)
        
    Returns:
        List of SEO analysis reports
    """
    # Enforce maximum limit
    limit = min(limit, 100)
    
    logger.info(f"Fetching reports: skip={skip}, limit={limit}")
    
    try:
        reports = db.query(models.Report)\
            .order_by(models.Report.created_at.desc())\
            .offset(skip)\
            .limit(limit)\
            .all()
        
        logger.info(f"Retrieved {len(reports)} reports")
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
    db: Session = Depends(database.get_db)
):
    """
    Retrieve a specific SEO analysis report by ID.
    
    Args:
        report_id: The ID of the report to retrieve
        
    Returns:
        SEO analysis report
    """
    logger.info(f"Fetching report with ID: {report_id}")
    
    try:
        report = db.query(models.Report).filter(models.Report.id == report_id).first()
        
        if not report:
            logger.warning(f"Report not found: {report_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Report with ID {report_id} not found"
            )
        
        return report
        
    except SQLAlchemyError as e:
        logger.error(f"Database error while fetching report {report_id}: {e}")
        raise DatabaseException("Failed to retrieve report")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
