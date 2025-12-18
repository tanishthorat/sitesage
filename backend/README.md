# SiteSage Backend

> Production-grade SEO analysis API with Firebase Authentication

## 🚀 Features

- **Firebase Authentication**: Secure user management with JWT token verification
- **SEO Analysis**: Comprehensive website crawling and scoring (0-100)
- **AI-Powered Insights**: Google Gemini 1.5 Flash for actionable suggestions
- **Lighthouse Metrics**: Google PageSpeed Insights integration
- **History Tracking**: Track SEO improvements over time
- **Cool-down Protection**: 15-minute rate limiting per URL
- **PostgreSQL Database**: With connection pooling and migrations
- **Async Operations**: Non-blocking web crawler and background tasks
- **Rate Limiting**: 30 requests/minute per IP
- **Comprehensive Logging**: Structured logging with file output
- **Error Handling**: Global exception handlers with proper HTTP status codes
- **API Documentation**: Interactive Swagger UI at `/docs`

## 🏗️ Architecture

```
backend/
├── app/
│   ├── main.py              # FastAPI application & routes
│   ├── database.py          # SQLAlchemy setup & connection
│   ├── models.py            # Database models (User, Report)
│   ├── schemas.py           # Pydantic validation schemas
│   ├── config.py            # Environment configuration
│   ├── logger.py            # Logging configuration
│   ├── exceptions.py        # Custom exception classes
│   ├── firebase_auth.py     # 🆕 Firebase authentication
│   ├── services/
│   │   ├── crawler.py       # Async web crawler
│   │   ├── ai_agent.py      # Google Gemini integration
│   │   └── pagespeed.py     # 🆕 Lighthouse metrics
│   └── middleware/
│       └── rate_limit.py    # Rate limiting middleware
├── alembic/                 # Database migrations
├── tests/                   # Test suite
├── logs/                    # Application logs
├── serviceAccountKey.json   # Firebase credentials (git-ignored)
├── requirements.txt         # Python dependencies
└── Dockerfile              # Container definition
```

## 📋 Prerequisites

- Docker & Docker Compose
- Firebase project with service account key
- Google API key (for PageSpeed Insights)

## 🔧 Setup

### 1. Clone and Navigate
```bash
cd backend
```

### 2. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create project → Enable Authentication (Email/Password)
3. Project Settings → Service Accounts → Generate Private Key
4. Save as `backend/serviceAccountKey.json`

### 3. Environment Variables
Create `backend/.env`:
```env
# Database
DATABASE_URL=postgresql://sitesage:password@postgres:5432/sitesage

# API Keys
GOOGLE_API_KEY=your_google_api_key_here

# Application
PROJECT_NAME=SiteSage API
ENVIRONMENT=development
DEBUG=True
API_V1_PREFIX=/api/v1

# CORS (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:8000

# Rate Limiting
RATE_LIMIT_PER_MINUTE=30
CRAWLER_TIMEOUT=30
```

### 4. Start Services
```bash
# From project root
docker-compose up -d

# Or rebuild if needed
docker-compose build backend
docker-compose up -d backend
```

### 5. Run Migrations
```bash
docker-compose exec backend alembic upgrade head
```

### 6. Verify
```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy","database":"healthy","version":"1.0.0"}
```

## 🔐 Authentication

All API endpoints (except `/health` and `/`) require Firebase authentication.

### Example Request
```bash
TOKEN="your_firebase_id_token"

curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

See [AUTHENTICATION.md](./AUTHENTICATION.md) for detailed auth guide.

## 📍 API Endpoints

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | Health check with DB status |
| GET | `/docs` | Interactive API documentation |

### Protected Endpoints (Require Auth)
| Method | Endpoint | Description | Cool-down |
|--------|----------|-------------|-----------|
| POST | `/api/v1/analyze` | Analyze URL for SEO | 15 min/URL |
| GET | `/api/v1/reports` | List user's reports | - |
| GET | `/api/v1/reports/{id}` | Get specific report | - |
| GET | `/api/v1/history/unique` | Unique URLs analyzed | - |
| GET | `/api/v1/history/{url}` | All reports for URL | - |

## 🧪 Testing

### Run Tests
```bash
# Run all tests
docker-compose exec backend pytest

# Run with coverage
docker-compose exec backend pytest --cov=app

# Run specific test file
docker-compose exec backend pytest tests/test_crawler.py -v
```

### Test Coverage
- ✅ Health endpoint
- ✅ Status endpoint
- ✅ Analyze endpoint
- ✅ Reports endpoints
- ✅ Crawler functionality
- ✅ SEO scoring algorithm

## 🗄️ Database Schema

### User Model
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    firebase_uid VARCHAR UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Report Model
```sql
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    url VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- SEO Metrics
    title VARCHAR,
    meta_description TEXT,
    h1_count INTEGER,
    h2_count INTEGER,
    image_count INTEGER,
    missing_alt_count INTEGER,
    load_time FLOAT,
    seo_score INTEGER,
    
    -- AI Analysis
    ai_summary TEXT,
    ai_suggestions JSONB,
    
    -- Lighthouse Metrics (Background Task)
    lighthouse_performance FLOAT,
    lighthouse_accessibility FLOAT,
    lighthouse_seo FLOAT,
    lighthouse_best_practices FLOAT
);
```

## 🔄 Database Migrations

### Create Migration
```bash
docker-compose exec backend alembic revision --autogenerate -m "Description"
```

### Apply Migrations
```bash
docker-compose exec backend alembic upgrade head
```

### Rollback Migration
```bash
docker-compose exec backend alembic downgrade -1
```

### View History
```bash
docker-compose exec backend alembic history
```

## 📊 SEO Scoring Algorithm

Reports receive a score from 0-100 based on:

- ✅ **Title Tag** (+10): Present and 30-60 characters
- ✅ **Meta Description** (+10): Present and 120-160 characters
- ✅ **H1 Heading** (+15): Exactly one H1 tag
- ✅ **Headings Hierarchy** (+10): Proper H2 structure
- ✅ **Image Alt Text** (+15): All images have alt attributes
- ✅ **Viewport Meta** (+10): Mobile-friendly viewport tag
- ✅ **Canonical URL** (+10): Canonical link present
- ✅ **Load Time** (+10): Page loads under 3 seconds
- ⚠️ **Penalties**: Missing critical elements

## 🤖 AI Analysis

Powered by **Google Gemini 1.5 Flash**:
- Analyzes SEO metrics
- Generates actionable suggestions
- Prioritizes improvements
- Explains impact

Example AI Output:
```json
{
  "summary": "Your website shows good SEO fundamentals...",
  "suggestions": [
    "Add meta description for better search visibility",
    "Optimize images with descriptive alt text",
    "Reduce page load time to under 3 seconds"
  ]
}
```

## 🚦 Lighthouse Integration

Google PageSpeed Insights metrics (0-100):
- **Performance**: Page speed and optimization
- **Accessibility**: WCAG compliance
- **SEO**: Search engine optimization
- **Best Practices**: Modern web standards

Fetched asynchronously in background (30-60 seconds).

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | Required | PostgreSQL connection string |
| `GOOGLE_API_KEY` | Required | Google API key for Gemini & PageSpeed |
| `PROJECT_NAME` | SiteSage API | Application name |
| `ENVIRONMENT` | development | Environment (dev/prod) |
| `DEBUG` | True | Debug mode |
| `API_V1_PREFIX` | /api/v1 | API version prefix |
| `CORS_ORIGINS` | localhost:3000 | Allowed CORS origins |
| `RATE_LIMIT_PER_MINUTE` | 30 | Requests per minute |
| `CRAWLER_TIMEOUT` | 30 | Crawler timeout (seconds) |

## 🛠️ Development

### Local Development (without Docker)
```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL=postgresql://...
export GOOGLE_API_KEY=...

# Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Watch Logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Last 50 lines
docker-compose logs --tail=50 backend
```

### Access Database
```bash
docker-compose exec postgres psql -U sitesage -d sitesage
```

## 🐛 Troubleshooting

### "Authentication service unavailable"
```bash
# Check if serviceAccountKey.json exists
ls serviceAccountKey.json

# Check logs for Firebase initialization
docker-compose logs backend | grep -i firebase
```

### Database Connection Issues
```bash
# Check database health
docker-compose ps postgres

# Test connection
docker-compose exec backend python -c "from app.database import engine; engine.connect()"
```

### Lighthouse Metrics Not Populating
```bash
# Check background task logs
docker-compose logs backend | grep -i lighthouse

# Verify Google API key
docker-compose exec backend env | grep GOOGLE_API_KEY

# Check PageSpeed API quota (free tier: 50/day)
```

### Import Errors
```bash
# Rebuild without cache
docker-compose build --no-cache backend
docker-compose up -d backend
```

## 📚 Documentation

- **[AUTHENTICATION.md](./AUTHENTICATION.md)** - Firebase auth setup & usage
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Implementation details
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick API reference
- **[Interactive API Docs](http://localhost:8000/docs)** - Swagger UI

## 🔒 Security

- ✅ Firebase JWT token verification
- ✅ User data isolation (ownership checks)
- ✅ SQL injection protection (SQLAlchemy ORM)
- ✅ XSS protection (Pydantic validation)
- ✅ CORS configuration
- ✅ Rate limiting (IP-based)
- ✅ Cool-down protection (user + URL)
- ✅ Secure credential management (.gitignore)

## 📦 Dependencies

### Core
- `fastapi==0.109.0` - Web framework
- `uvicorn==0.27.0` - ASGI server
- `sqlalchemy==2.0.25` - ORM
- `alembic==1.13.1` - Migrations
- `pydantic==2.5.3` - Validation

### Database
- `psycopg2-binary==2.9.9` - PostgreSQL adapter
- `asyncpg==0.29.0` - Async PostgreSQL

### Authentication
- `firebase-admin==6.2.0` - Firebase SDK
- `email-validator==2.1.0` - Email validation

### AI & Analysis
- `langchain==0.1.0` - AI framework
- `langchain-google-genai==0.0.5` - Gemini integration
- `aiohttp==3.9.1` - Async HTTP client
- `beautifulsoup4==4.12.3` - HTML parsing

### Testing
- `pytest==7.4.4` - Test framework
- `pytest-asyncio==0.23.3` - Async testing
- `httpx==0.26.0` - HTTP test client

## 🚀 Deployment

### Production Checklist
- [ ] Set `ENVIRONMENT=production` in `.env`
- [ ] Set `DEBUG=False`
- [ ] Use production database URL
- [ ] Add Firebase service account key
- [ ] Configure production CORS origins
- [ ] Enable Firebase email verification
- [ ] Set up monitoring (e.g., Sentry)
- [ ] Configure reverse proxy (Nginx)
- [ ] Enable HTTPS
- [ ] Set up backup strategy
- [ ] Configure log rotation
- [ ] Enable PageSpeed API billing (if needed)

### Docker Production
```bash
# Build for production
docker-compose -f docker-compose.prod.yml build

# Run with production config
docker-compose -f docker-compose.prod.yml up -d
```

## 📄 License

This project is part of a job application for Madeline & Co.

## 👥 Contact

For questions or issues, please refer to the project requirements document.

---

**Backend Status**: ✅ Production Ready  
**Last Updated**: December 18, 2025  
**Version**: 1.0.0
