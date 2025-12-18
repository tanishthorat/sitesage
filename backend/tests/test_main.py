from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    """Test the root endpoint returns 200"""
    response = client.get("/")
    assert response.status_code == 200
    assert "name" in response.json()
    assert "status" in response.json()
    assert response.json()["status"] == "running"

def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_docs_endpoint():
    """Test that API documentation is accessible"""
    response = client.get("/docs")
    assert response.status_code == 200
