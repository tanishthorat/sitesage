"""Google PageSpeed Insights API Integration for Lighthouse Metrics"""
import aiohttp
import logging
from typing import Dict, Optional
from ..config import settings
from ..exceptions import SiteSageException

logger = logging.getLogger(__name__)

# Google PageSpeed Insights API endpoint
PAGESPEED_API_URL = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"

class PageSpeedException(SiteSageException):
    """Exception raised when PageSpeed Insights API fails"""
    def __init__(self, message: str = "PageSpeed Insights API failed"):
        super().__init__(message, status_code=500)

async def fetch_lighthouse_metrics(url: str, api_key: Optional[str] = None) -> Dict:
    """
    Fetch Lighthouse metrics from Google PageSpeed Insights API.
    
    Args:
        url: The URL to analyze
        api_key: Google API key (optional, but recommended for higher quotas)
        
    Returns:
        Dictionary containing Lighthouse scores:
        - performance: 0-100
        - accessibility: 0-100
        - seo: 0-100
        - best_practices: 0-100
        
    Raises:
        PageSpeedException: If API call fails
    """
    try:
        params = {
            "url": url,
            "category": ["PERFORMANCE", "ACCESSIBILITY", "SEO", "BEST_PRACTICES"],
            "strategy": "MOBILE"  # Can be MOBILE or DESKTOP
        }
        
        # Add API key if provided
        if api_key or settings.GOOGLE_API_KEY:
            params["key"] = api_key or settings.GOOGLE_API_KEY
        
        logger.info(f"Fetching Lighthouse metrics for: {url}")
        
        async with aiohttp.ClientSession() as session:
            async with session.get(
                PAGESPEED_API_URL,
                params=params,
                timeout=aiohttp.ClientTimeout(total=60)  # Lighthouse can take time
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"PageSpeed API error ({response.status}): {error_text}")
                    raise PageSpeedException(
                        f"PageSpeed API returned status {response.status}"
                    )
                
                data = await response.json()
        
        # Extract Lighthouse scores
        lighthouse_result = data.get("lighthouseResult", {})
        categories = lighthouse_result.get("categories", {})
        
        metrics = {
            "performance": _extract_score(categories, "performance"),
            "accessibility": _extract_score(categories, "accessibility"),
            "seo": _extract_score(categories, "seo"),
            "best_practices": _extract_score(categories, "best-practices")
        }
        
        logger.info(f"Lighthouse metrics fetched successfully: {metrics}")
        return metrics
        
    except aiohttp.ClientError as e:
        logger.error(f"HTTP error while fetching Lighthouse metrics: {e}")
        raise PageSpeedException(f"Failed to connect to PageSpeed API: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error fetching Lighthouse metrics: {e}")
        raise PageSpeedException(f"Lighthouse analysis failed: {str(e)}")

def _extract_score(categories: Dict, category_name: str) -> Optional[float]:
    """
    Extract score from PageSpeed Insights category.
    Scores are returned as 0-1, we convert to 0-100.
    """
    try:
        category_data = categories.get(category_name, {})
        score = category_data.get("score")
        if score is not None:
            return round(score * 100, 2)  # Convert 0-1 to 0-100
        return None
    except Exception as e:
        logger.warning(f"Failed to extract {category_name} score: {e}")
        return None

async def fetch_lighthouse_metrics_safe(url: str) -> Dict:
    """
    Safely fetch Lighthouse metrics with fallback to None on error.
    Useful for background tasks where we don't want to fail the main request.
    """
    try:
        return await fetch_lighthouse_metrics(url)
    except Exception as e:
        logger.error(f"Failed to fetch Lighthouse metrics (safe mode): {e}")
        return {
            "performance": None,
            "accessibility": None,
            "seo": None,
            "best_practices": None
        }
