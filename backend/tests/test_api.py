"""Comprehensive tests for the SiteSage API"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app import models
from app.firebase_auth import get_current_user

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

def override_get_db():
    """Override database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

def override_get_current_user():
    """Mock authenticated user for testing"""
    db = TestingSessionLocal()
    # Create or get test user
    user = db.query(models.User).filter(models.User.email == "test@example.com").first()
    if not user:
        user = models.User(
            email="test@example.com",
            firebase_uid="test-uid-123",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)

class TestStatusEndpoints:
    """Test status and health endpoints"""
    
    def test_root_endpoint(self):
        """Test root endpoint returns correct information"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "version" in data
        assert data["status"] == "running"
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "database" in data
        assert "version" in data

class TestAnalyzeEndpoint:
    """Test URL analysis endpoint"""
    
    @pytest.mark.asyncio
    async def test_analyze_invalid_url(self):
        """Test analysis with invalid URL"""
        response = client.post(
            "/api/v1/analyze",
            json={"url": "not-a-valid-url"}
        )
        assert response.status_code in [400, 422]
    
    @pytest.mark.asyncio
    async def test_analyze_missing_url(self):
        """Test analysis without URL"""
        response = client.post("/api/v1/analyze", json={})
        assert response.status_code == 422

class TestReportsEndpoint:
    """Test reports retrieval endpoints"""
    
    def test_get_reports_empty(self):
        """Test getting reports when database is empty"""
        response = client.get("/api/v1/reports")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_get_reports_with_pagination(self):
        """Test reports pagination"""
        response = client.get("/api/v1/reports?skip=0&limit=10")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 10
    
    def test_get_nonexistent_report(self):
        """Test getting a report that doesn't exist"""
        response = client.get("/api/v1/reports/99999")
        assert response.status_code == 404

class TestRateLimiting:
    """Test rate limiting functionality"""
    
    def test_rate_limit_exempt_endpoints(self):
        """Test that health and docs endpoints are exempt from rate limiting"""
        for _ in range(50):
            response = client.get("/health")
            assert response.status_code == 200

class TestDocumentation:
    """Test API documentation endpoints"""
    
    def test_openapi_schema(self):
        """Test OpenAPI schema is accessible"""
        response = client.get("/openapi.json")
        assert response.status_code == 200
        data = response.json()
        assert "openapi" in data
        assert "info" in data
        assert "paths" in data
    
    def test_swagger_docs(self):
        """Test Swagger documentation is accessible"""
        response = client.get("/docs")
        assert response.status_code == 200
    
    def test_redoc_docs(self):
        """Test ReDoc documentation is accessible"""
        response = client.get("/redoc")
        assert response.status_code == 200

class TestDatabaseModels:
    """Test database models"""
    
    def test_create_report(self):
        """Test creating a report in the database"""
        db = TestingSessionLocal()
        
        report = models.Report(
            url="https://example.com",
            title="Test Website",
            meta_description="Test description",
            h1_count=1,
            h2_count=3,
            image_count=5,
            missing_alt_count=1,
            load_time=1.5,
            seo_score=85,
            ai_summary="Good SEO health",
            ai_suggestions=["Improve alt tags", "Add more H2 headings"]
        )
        
        db.add(report)
        db.commit()
        db.refresh(report)
        
        assert report.id is not None
        assert report.url == "https://example.com"
        assert report.seo_score == 85
        
        db.close()

class TestErrorHandling:
    """Test error handling"""
    
    def test_validation_error_response(self):
        """Test validation error returns proper format"""
        response = client.post("/api/v1/analyze", json={"url": 123})
        assert response.status_code == 422
        data = response.json()
        assert "error" in data or "detail" in data
