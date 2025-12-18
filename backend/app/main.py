from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, database
from .services import crawler
from .services.ai_agent import analyze_with_ai

# 1. Create Tables (Quick hack for dev; we will add Alembic later)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="SiteSage API",
    description="Automated SEO Performance Analyzer",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to SiteSage API updated!",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


# 2. API Endpoints
@app.post("/analyze", response_model=schemas.ReportResponse)
def analyze_url(request: schemas.ReportCreate, db: Session = Depends(database.get_db)):
    # Run Crawler
    data = crawler.crawl_website(str(request.url))
    
    if not data:
        raise HTTPException(status_code=400, detail="Could not crawl URL")

    # Run AI Analysis
    ai_result = analyze_with_ai(data)
    
    # Save to DB
    db_report = models.Report(
        url=str(request.url),
        title=data['title'],
        meta_description=data['meta_description'],
        h1_count=data['h1_count'],
        h2_count=data['h2_count'],
        image_count=data['image_count'],
        missing_alt_count=data['missing_alt_count'],
        load_time=data['load_time'],
        seo_score=data['seo_score'],
        ai_summary=ai_result.get('summary', 'AI Analysis Unavailable'),
        ai_suggestions=ai_result.get('suggestions', [])
    )
    
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    
    return db_report

@app.get("/reports", response_model=list[schemas.ReportResponse])
def get_reports(skip: int = 0, limit: int = 10, db: Session = Depends(database.get_db)):
    return db.query(models.Report).offset(skip).limit(limit).all()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
