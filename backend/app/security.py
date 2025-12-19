"""
Security dependencies for the API
"""
from fastapi import Header, HTTPException, status
from .config import settings
from .logger import logger


async def verify_internal_api_key(x_internal_api_key: str = Header(None)):
    """
    Verify the internal API key from the request header.
    
    This dependency ensures that only requests from our trusted Next.js frontend
    (via the BFF proxy) can access protected endpoints.
    
    Args:
        x_internal_api_key: The internal API key from the X-INTERNAL-API-KEY header
        
    Raises:
        HTTPException: 403 Forbidden if the API key is missing or invalid
    """
    # Get the expected API key from environment variables
    expected_api_key = settings.INTERNAL_API_KEY
    
    # Check if API key is configured
    if not expected_api_key:
        logger.error("INTERNAL_API_KEY is not configured in environment variables")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal API key not configured"
        )
    
    # Check if API key is provided in request
    if not x_internal_api_key:
        logger.warning("Request rejected: Missing X-INTERNAL-API-KEY header")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Missing internal API key"
        )
    
    # Verify the API key matches
    if x_internal_api_key != expected_api_key:
        logger.warning("Request rejected: Invalid X-INTERNAL-API-KEY header")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Invalid internal API key"
        )
    
    # API key is valid
    return True
