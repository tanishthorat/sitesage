"""Custom exceptions for the SiteSage application"""

class SiteSageException(Exception):
    """Base exception for SiteSage application"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class CrawlerException(SiteSageException):
    """Exception raised when crawler fails"""
    def __init__(self, message: str = "Failed to crawl website"):
        super().__init__(message, status_code=400)

class DatabaseException(SiteSageException):
    """Exception raised for database errors"""
    def __init__(self, message: str = "Database operation failed"):
        super().__init__(message, status_code=500)

class AIAnalysisException(SiteSageException):
    """Exception raised when AI analysis fails"""
    def __init__(self, message: str = "AI analysis failed"):
        super().__init__(message, status_code=500)

class ValidationException(SiteSageException):
    """Exception raised for validation errors"""
    def __init__(self, message: str = "Validation failed"):
        super().__init__(message, status_code=422)

class RateLimitException(SiteSageException):
    """Exception raised when rate limit is exceeded"""
    def __init__(self, message: str = "Rate limit exceeded"):
        super().__init__(message, status_code=429)
