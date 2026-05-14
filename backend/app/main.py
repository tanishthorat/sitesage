"""
SiteSage API - Main Application Entry Point.

This is the minimal entry point that initializes the FastAPI application,
registers routes, middleware, and exception handlers.

All business logic has been moved to:
- api/routes.py - API endpoints
- services/ - Business logic
- core/ - Configuration and dependencies
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from contextlib import asynccontextmanager
import subprocess
import sys
from pathlib import Path

from .config import settings
from .logger import logger
from .exceptions import SiteSageException
from .middleware.rate_limit import RateLimitMiddleware
from .firebase_auth import initialize_firebase
from . import database
from .api.routes import router


# ============================================================================
# Application Lifespan Handler
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handle application startup and shutdown events.
    
    Startup:
    - Initialize Firebase authentication
    - Initialize database tables (development only)
    
    Shutdown:
    - Log graceful shutdown
    """
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

    # Apply database migrations before serving requests.
    # This keeps the ORM model and the actual schema in sync, which prevents
    # commit-time failures when new report columns are added.
    try:
        project_root = Path(__file__).resolve().parents[1]
        result = subprocess.run(
            [sys.executable, "-m", "alembic", "upgrade", "head"],
            cwd=str(project_root),
            capture_output=True,
            text=True,
            check=True,
        )
        if result.stdout:
            logger.info(result.stdout.strip())
        logger.info("Database migrations applied successfully")
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to apply database migrations: {e.stderr or e.stdout or e}")
        raise
    
    # Initialize database tables (for development only)
    # In production, use Alembic migrations
    if settings.ENVIRONMENT == "development":
        database.init_db()
        logger.info("Database tables initialized")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application")


# ============================================================================
# FastAPI Application
# ============================================================================

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)


# ============================================================================
# Middleware Configuration
# ============================================================================

# CORS Middleware (BFF Security - Strict origin control)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # Strictly controlled via environment
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Explicit methods only
    allow_headers=["Content-Type", "Authorization", "X-INTERNAL-API-KEY"],  # Include internal key
    expose_headers=["*"],
)

# Rate Limiting Middleware
app.add_middleware(RateLimitMiddleware)


# ============================================================================
# Exception Handlers
# ============================================================================

@app.exception_handler(SiteSageException)
async def sitesage_exception_handler(request: Request, exc: SiteSageException):
    """Handle custom SiteSage exceptions."""
    logger.error(f"SiteSage error: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.message, "type": exc.__class__.__name__}
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors."""
    logger.warning(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"error": "Validation failed", "details": exc.errors()}
    )


@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(request: Request, exc: SQLAlchemyError):
    """Handle database errors."""
    logger.error(f"Database error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": "Database operation failed"}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions."""
    logger.exception(f"Unexpected error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )


# ============================================================================
# Register Routes
# ============================================================================

# Include all API routes
app.include_router(router)


# ============================================================================
# Application Entry Point
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
