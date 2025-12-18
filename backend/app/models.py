from sqlalchemy import Column, Integer, String, JSON, DateTime, Float
from sqlalchemy.sql import func
from .database import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # SEO Metrics
    title = Column(String, nullable=True)
    meta_description = Column(String, nullable=True)
    h1_count = Column(Integer, default=0)
    h2_count = Column(Integer, default=0)
    image_count = Column(Integer, default=0)
    missing_alt_count = Column(Integer, default=0)
    
    # Performance
    load_time = Column(Float, default=0.0) # In seconds
    seo_score = Column(Integer, default=0)
    
    # AI Analysis (Stored as JSON)
    ai_summary = Column(String, nullable=True)
    ai_suggestions = Column(JSON, nullable=True) # List of strings
