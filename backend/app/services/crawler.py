import aiohttp
import asyncio
from bs4 import BeautifulSoup
from typing import Dict, Optional
import logging
from urllib.parse import urlparse, urljoin
from collections import Counter
import re
import string
from ..config import settings
from ..exceptions import CrawlerException

logger = logging.getLogger(__name__)

# Common English stop words to exclude from keyword analysis
STOP_WORDS = {
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 
    'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 
    'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 
    'why', 'how', 'all', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 
    'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 
    'should', 'now', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 
    'had', 'having', 'do', 'does', 'did', 'doing', 'would', 'could', 'ought', 'i', 'you', 'he', 
    'she', 'it', 'we', 'they', 'them', 'their', 'what', 'which', 'who', 'this', 'that', 'these', 
    'those', 'as', 'if', 'while', 'because', 'until', 'since', 'unless', 'although', 'though'
}

async def crawl_website(url: str) -> Dict:
    """
    Asynchronously crawl a website and extract SEO metrics.
    
    Args:
        url: The URL to crawl
        
    Returns:
        Dictionary containing SEO metrics
        
    Raises:
        CrawlerException: If crawling fails
    """
    try:
        # Validate URL format
        parsed_url = urlparse(url)
        if not parsed_url.scheme or not parsed_url.netloc:
            raise CrawlerException(f"Invalid URL format: {url}")
        
        start_time = asyncio.get_event_loop().time()
        
        # Configure headers
        headers = {
            'User-Agent': settings.CRAWLER_USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        }
        
        # Create async HTTP session with timeout
        timeout = aiohttp.ClientTimeout(total=settings.CRAWLER_TIMEOUT)
        
        async with aiohttp.ClientSession(timeout=timeout) as session:
            try:
                async with session.get(url, headers=headers, allow_redirects=True) as response:
                    load_time = round(asyncio.get_event_loop().time() - start_time, 2)
                    
                    if response.status != 200:
                        logger.warning(f"Non-200 status code for {url}: {response.status}")
                        raise CrawlerException(f"Website returned status code {response.status}")
                    
                    # Read and parse HTML
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
            except aiohttp.ClientError as e:
                logger.error(f"HTTP client error for {url}: {e}")
                raise CrawlerException(f"Failed to fetch website: {str(e)}")
            except asyncio.TimeoutError:
                logger.error(f"Timeout while crawling {url}")
                raise CrawlerException(f"Request timeout after {settings.CRAWLER_TIMEOUT}s")
            
            # Extract SEO data
            seo_data = _extract_seo_metrics(soup, url, load_time)
            
            # Extract Pro SEO metrics (needs session for robots.txt/sitemap checks)
            pro_metrics = await _extract_pro_metrics(soup, url, session)
            seo_data.update(pro_metrics)
        
        logger.info(f"Successfully crawled {url} - Score: {seo_data['seo_score']}")
        return seo_data
        
    except CrawlerException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error crawling {url}: {e}")
        raise CrawlerException(f"Crawling failed: {str(e)}")

def _extract_seo_metrics(soup: BeautifulSoup, url: str, load_time: float) -> Dict:
    """Extract SEO metrics from parsed HTML"""
    
    # 1. Extract Title
    title_tag = soup.find('title')
    title = title_tag.string.strip() if title_tag and title_tag.string else None
    
    # 2. Extract Meta Description
    meta_desc = soup.find("meta", attrs={"name": "description"})
    meta_description = meta_desc.get("content", "").strip() if meta_desc else None
    
    # 3. Headings Analysis
    h1_tags = soup.find_all('h1')
    h2_tags = soup.find_all('h2')
    h1_count = len(h1_tags)
    h2_count = len(h2_tags)
    
    # 4. Images & Alt Tags
    images = soup.find_all('img')
    image_count = len(images)
    missing_alt_count = sum(1 for img in images if not img.get('alt') or not img.get('alt').strip())
    
    # 5. Additional SEO Factors
    has_meta_viewport = bool(soup.find("meta", attrs={"name": "viewport"}))
    has_canonical = bool(soup.find("link", attrs={"rel": "canonical"}))
    
    # 6. Calculate SEO Score
    seo_score = _calculate_seo_score(
        title=title,
        meta_description=meta_description,
        h1_count=h1_count,
        h2_count=h2_count,
        missing_alt_count=missing_alt_count,
        image_count=image_count,
        has_meta_viewport=has_meta_viewport,
        has_canonical=has_canonical
    )
    
    return {
        "url": url,
        "title": title or "No Title Found",
        "meta_description": meta_description,
        "h1_count": h1_count,
        "h2_count": h2_count,
        "image_count": image_count,
        "missing_alt_count": missing_alt_count,
        "load_time": load_time,
        "seo_score": seo_score
    }

def _calculate_seo_score(
    title: Optional[str],
    meta_description: Optional[str],
    h1_count: int,
    h2_count: int,
    missing_alt_count: int,
    image_count: int,
    has_meta_viewport: bool,
    has_canonical: bool
) -> int:
    """
    Calculate SEO score based on various metrics.
    Score ranges from 0 to 100.
    """
    score = 100
    
    # Title checks (15 points)
    if not title:
        score -= 15
    elif len(title) < 30:
        score -= 5
    elif len(title) > 60:
        score -= 5
    
    # Meta description checks (20 points)
    if not meta_description:
        score -= 20
    elif len(meta_description) < 120:
        score -= 5
    elif len(meta_description) > 160:
        score -= 5
    
    # H1 checks (15 points)
    if h1_count == 0:
        score -= 15
    elif h1_count > 1:
        score -= 10
    
    # H2 checks (5 points)
    if h2_count == 0:
        score -= 5
    
    # Image alt tags (15 points)
    if image_count > 0:
        alt_percentage = (missing_alt_count / image_count) * 100
        if alt_percentage > 50:
            score -= 15
        elif alt_percentage > 20:
            score -= 10
        elif alt_percentage > 0:
            score -= 5
    
    # Mobile optimization (10 points)
    if not has_meta_viewport:
        score -= 10
    
    # Canonical URL (5 points)
    if not has_canonical:
        score -= 5
    
    # Ensure score is within 0-100
    return max(0, min(100, score))

async def _extract_pro_metrics(soup: BeautifulSoup, url: str, session: aiohttp.ClientSession) -> Dict:
    """
    Extract advanced Pro SEO metrics from the page.
    
    Args:
        soup: Parsed HTML content
        url: The page URL
        session: Active aiohttp session
        
    Returns:
        Dictionary containing Pro SEO metrics
    """
    parsed_url = urlparse(url)
    base_domain = f"{parsed_url.scheme}://{parsed_url.netloc}"
    
    # 1. Word Count
    body = soup.find('body')
    body_text = body.get_text(separator=' ', strip=True) if body else ''
    words = body_text.split()
    word_count = len(words)
    
    # 2. Internal & External Links Count
    internal_links = 0
    external_links = 0
    
    for link in soup.find_all('a', href=True):
        href = link['href'].strip()
        if not href or href.startswith('#') or href.startswith('javascript:') or href.startswith('mailto:'):
            continue
            
        # Convert relative URLs to absolute
        absolute_url = urljoin(url, href)
        link_domain = urlparse(absolute_url)
        
        # Check if internal or external
        if link_domain.netloc == parsed_url.netloc or link_domain.netloc == '':
            internal_links += 1
        else:
            external_links += 1
    
    # 3. Canonical URL
    canonical_tag = soup.find('link', attrs={'rel': 'canonical'})
    canonical_url = canonical_tag.get('href') if canonical_tag else None
    
    # 4. Open Graph Tags Present
    og_tags = soup.find_all('meta', property=lambda x: x and x.startswith('og:'))
    og_tags_present = len(og_tags) > 0
    
    # 5. Schema.org / JSON-LD Present
    schema_scripts = soup.find_all('script', type='application/ld+json')
    schema_present = len(schema_scripts) > 0
    
    # 6. Check robots.txt and sitemap.xml existence
    robots_txt_exists = await _check_url_exists(f"{base_domain}/robots.txt", session)
    sitemap_exists = await _check_url_exists(f"{base_domain}/sitemap.xml", session)
    
    # 7. Top Keywords (Top 10 most frequent words, excluding stop words)
    top_keywords = _extract_top_keywords(body_text, top_n=10)
    
    return {
        'word_count': word_count,
        'internal_links_count': internal_links,
        'external_links_count': external_links,
        'canonical_url': canonical_url,
        'og_tags_present': og_tags_present,
        'schema_present': schema_present,
        'robots_txt_exists': robots_txt_exists,
        'sitemap_exists': sitemap_exists,
        'top_keywords': top_keywords
    }

async def _check_url_exists(url: str, session: aiohttp.ClientSession) -> bool:
    """
    Check if a URL exists by performing a HEAD request.
    
    Args:
        url: URL to check
        session: Active aiohttp session
        
    Returns:
        True if URL returns 200, False otherwise
    """
    try:
        timeout = aiohttp.ClientTimeout(total=5)  # Short timeout for technical files
        async with session.head(url, timeout=timeout, allow_redirects=True) as response:
            return response.status == 200
    except Exception as e:
        logger.debug(f"Failed to check {url}: {e}")
        return False

def _extract_top_keywords(text: str, top_n: int = 10) -> list:
    """
    Extract top N most frequent keywords from text, excluding stop words.
    
    Args:
        text: Text to analyze
        top_n: Number of top keywords to return
        
    Returns:
        List of top keywords
    """
    # Convert to lowercase and remove punctuation
    text_lower = text.lower()
    # Remove punctuation
    translator = str.maketrans(string.punctuation, ' ' * len(string.punctuation))
    text_clean = text_lower.translate(translator)
    
    # Split into words
    words = text_clean.split()
    
    # Filter out stop words and short words
    filtered_words = [
        word for word in words 
        if word not in STOP_WORDS and len(word) > 2 and word.isalpha()
    ]
    
    # Count word frequency
    word_counts = Counter(filtered_words)
    
    # Get top N keywords
    top_keywords = [word for word, count in word_counts.most_common(top_n)]
    
    return top_keywords
