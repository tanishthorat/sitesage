from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@postgres:5432/sitesage"
    DATABASE_POOL_SIZE: int = 5
    DATABASE_MAX_OVERFLOW: int = 10
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "SiteSage API"
    VERSION: str = "1.0.1"
    DESCRIPTION: str = "Automated SEO Performance Analyzer"
    
    # CORS
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:8000"]
    
    # Security - Internal API Key for BFF Pattern
    INTERNAL_API_KEY: Optional[str] = None
    
    # Google Gemini
    GOOGLE_API_KEY: Optional[str] = None
    
    # Crawler
    CRAWLER_TIMEOUT: int = 10
    CRAWLER_USER_AGENT: str = "Mozilla/5.0 (compatible; SiteSage/1.0)"
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 30
    
    # Ephemeral Storage - Guest Report Cleanup
    GUEST_REPORT_RETENTION_HOURS: int = 24
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields from .env

# Global settings instance
settings = Settings()
