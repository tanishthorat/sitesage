from pydantic import BaseModel, HttpUrl, EmailStr
from typing import List, Optional
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr

class UserResponse(UserBase):
    id: int
    firebase_uid: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Report Schemas
class ReportBase(BaseModel):
    url: HttpUrl

class ReportCreate(ReportBase):
    pass

class ReportResponse(ReportBase):
    id: int
    user_id: int
    created_at: datetime
    title: Optional[str]
    meta_description: Optional[str]
    h1_count: int
    h2_count: int
    image_count: int
    missing_alt_count: int
    
    # Pro SEO Metrics
    word_count: int
    internal_links_count: int
    external_links_count: int
    canonical_url: Optional[str]
    og_tags_present: bool
    schema_present: bool
    robots_txt_exists: bool
    sitemap_exists: bool
    top_keywords: Optional[List[str]]
    
    load_time: float
    seo_score: int
    ai_summary: Optional[str]
    ai_suggestions: Optional[List[str]]
    
    # Lighthouse metrics (from PageSpeed Insights)
    lighthouse_performance: Optional[float]
    lighthouse_accessibility: Optional[float]
    lighthouse_seo: Optional[float]
    lighthouse_best_practices: Optional[float]

    class Config:
        from_attributes = True

# History response for grouped reports
class HistoryURLResponse(BaseModel):
    url: str
    report_count: int
    latest_scan: datetime
    latest_seo_score: int
    
    class Config:
        from_attributes = True
