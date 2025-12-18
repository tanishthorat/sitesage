"""Tests for the crawler service"""
import pytest
from app.services.crawler import crawl_website, _extract_seo_metrics, _calculate_seo_score
from app.exceptions import CrawlerException
from bs4 import BeautifulSoup

class TestCrawler:
    """Test crawler functionality"""
    
    @pytest.mark.asyncio
    async def test_crawl_invalid_url(self):
        """Test crawling an invalid URL"""
        with pytest.raises(CrawlerException):
            await crawl_website("not-a-url")
    
    @pytest.mark.asyncio
    async def test_crawl_invalid_format(self):
        """Test crawling URL with invalid format"""
        with pytest.raises(CrawlerException):
            await crawl_website("invalid://url")

class TestSEOMetricsExtraction:
    """Test SEO metrics extraction"""
    
    def test_extract_seo_metrics_complete(self):
        """Test extracting SEO metrics from complete HTML"""
        html = """
        <html>
            <head>
                <title>Test Page</title>
                <meta name="description" content="Test description">
                <meta name="viewport" content="width=device-width">
                <link rel="canonical" href="https://example.com">
            </head>
            <body>
                <h1>Main Heading</h1>
                <h2>Subheading 1</h2>
                <h2>Subheading 2</h2>
                <img src="image1.jpg" alt="Image 1">
                <img src="image2.jpg" alt="">
                <img src="image3.jpg">
            </body>
        </html>
        """
        soup = BeautifulSoup(html, 'html.parser')
        metrics = _extract_seo_metrics(soup, "https://example.com", 1.5)
        
        assert metrics["title"] == "Test Page"
        assert metrics["meta_description"] == "Test description"
        assert metrics["h1_count"] == 1
        assert metrics["h2_count"] == 2
        assert metrics["image_count"] == 3
        assert metrics["missing_alt_count"] == 2  # One empty, one missing
        assert metrics["load_time"] == 1.5
        assert 0 <= metrics["seo_score"] <= 100
    
    def test_extract_seo_metrics_minimal(self):
        """Test extracting SEO metrics from minimal HTML"""
        html = "<html><head><title>Minimal</title></head><body></body></html>"
        soup = BeautifulSoup(html, 'html.parser')
        metrics = _extract_seo_metrics(soup, "https://example.com", 1.0)
        
        assert metrics["title"] == "Minimal"
        assert metrics["meta_description"] is None
        assert metrics["h1_count"] == 0
        assert metrics["h2_count"] == 0
        assert metrics["image_count"] == 0
    
    def test_extract_seo_metrics_no_title(self):
        """Test extracting SEO metrics when no title present"""
        html = "<html><head></head><body></body></html>"
        soup = BeautifulSoup(html, 'html.parser')
        metrics = _extract_seo_metrics(soup, "https://example.com", 1.0)
        
        assert metrics["title"] == "No Title Found"

class TestSEOScoreCalculation:
    """Test SEO score calculation logic"""
    
    def test_perfect_score(self):
        """Test perfect SEO score"""
        score = _calculate_seo_score(
            title="Perfect Title Length For SEO",
            meta_description="Perfect meta description length for SEO that is between 120 and 160 characters to ensure optimal display in search results.",
            h1_count=1,
            h2_count=3,
            missing_alt_count=0,
            image_count=5,
            has_meta_viewport=True,
            has_canonical=True
        )
        assert score == 100
    
    def test_no_title(self):
        """Test score when title is missing"""
        score = _calculate_seo_score(
            title=None,
            meta_description="Good meta description for testing purposes that meets length requirements.",
            h1_count=1,
            h2_count=3,
            missing_alt_count=0,
            image_count=5,
            has_meta_viewport=True,
            has_canonical=True
        )
        assert score < 100
        assert score >= 0
    
    def test_no_meta_description(self):
        """Test score when meta description is missing"""
        score = _calculate_seo_score(
            title="Good Title",
            meta_description=None,
            h1_count=1,
            h2_count=3,
            missing_alt_count=0,
            image_count=5,
            has_meta_viewport=True,
            has_canonical=True
        )
        assert score < 100
        assert score >= 0
    
    def test_multiple_h1(self):
        """Test score when multiple H1 tags present"""
        score = _calculate_seo_score(
            title="Good Title",
            meta_description="Good meta description for testing purposes that meets length requirements.",
            h1_count=3,  # Multiple H1s - bad practice
            h2_count=3,
            missing_alt_count=0,
            image_count=5,
            has_meta_viewport=True,
            has_canonical=True
        )
        assert score < 100
    
    def test_missing_alt_tags(self):
        """Test score when images have missing alt tags"""
        score = _calculate_seo_score(
            title="Good Title",
            meta_description="Good meta description for testing purposes that meets length requirements.",
            h1_count=1,
            h2_count=3,
            missing_alt_count=8,  # 80% missing
            image_count=10,
            has_meta_viewport=True,
            has_canonical=True
        )
        assert score < 100
    
    def test_score_boundaries(self):
        """Test that score stays within 0-100 boundaries"""
        # Test minimum
        score_min = _calculate_seo_score(
            title=None,
            meta_description=None,
            h1_count=0,
            h2_count=0,
            missing_alt_count=10,
            image_count=10,
            has_meta_viewport=False,
            has_canonical=False
        )
        assert 0 <= score_min <= 100
        
        # Test maximum
        score_max = _calculate_seo_score(
            title="Perfect Title Length For SEO",
            meta_description="Perfect meta description length for SEO that is between 120 and 160 characters to ensure optimal display.",
            h1_count=1,
            h2_count=5,
            missing_alt_count=0,
            image_count=10,
            has_meta_viewport=True,
            has_canonical=True
        )
        assert 0 <= score_max <= 100
