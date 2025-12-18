from sqlalchemy import Column, Integer, String, JSON, DateTime, Float, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from .database import Base

class User(Base):
    """User model linked to Firebase authentication"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    firebase_uid = Column(String, unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    reports = relationship("Report", back_populates="owner", cascade="all, delete-orphan")

class Report(Base):
    """SEO Analysis Report linked to a user"""
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    
    # User relationship
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Nullable for backward compatibility
    owner = relationship("User", back_populates="reports")
    
    # Tracking data
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
    load_time = Column(Float, default=0.0)  # In seconds
    seo_score = Column(Integer, default=0)
    
    # AI Analysis
    ai_summary = Column(Text, nullable=True)
    ai_suggestions = Column(JSON, nullable=True)  # List of strings
    
    # Lighthouse metrics (from Google PageSpeed Insights)
    lighthouse_performance = Column(Float, nullable=True)
    lighthouse_accessibility = Column(Float, nullable=True)
    lighthouse_seo = Column(Float, nullable=True)
    lighthouse_best_practices = Column(Float, nullable=True)
