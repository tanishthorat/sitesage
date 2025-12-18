from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from datetime import datetime

class ReportBase(BaseModel):
    url: HttpUrl

class ReportCreate(ReportBase):
    pass

class ReportResponse(ReportBase):
    id: int
    created_at: datetime
    title: Optional[str]
    meta_description: Optional[str]
    h1_count: int
    h2_count: int
    image_count: int
    missing_alt_count: int
    load_time: float
    seo_score: int
    ai_summary: Optional[str]
    ai_suggestions: Optional[List[str]]

    class Config:
        from_attributes = True
