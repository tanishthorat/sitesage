# 🚀 SiteSage - AI-Powered SEO Analysis Platform

> **Full-Stack web application for comprehensive SEO analysis with AI-powered insights**

[![Production Status](https://img.shields.io/badge/Status-Production%20Ready-success)](https://www.sitesage.live)
[![Backend API](https://img.shields.io/badge/Backend-FastAPI-009688)](https://api.sitesage.live/docs)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2015-000000)](https://www.sitesage.live)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Live Demo**: [https://www.sitesage.live](https://www.sitesage.live)  
**API Docs**: [https://api.sitesage.live/docs](https://api.sitesage.live/docs)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Security](#security)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🎯 Overview

SiteSage is a production-grade SEO analysis platform that provides instant, comprehensive website audits with AI-powered recommendations. Built with modern web technologies, it offers both authenticated and guest access, real-time analysis, and detailed performance metrics.

### Key Highlights

- ✅ **Real-time SEO Analysis** - Instant website crawling and scoring (0-100)
- ✅ **AI-Powered Insights** - Google Gemini 1.5 Flash integration for actionable suggestions
- ✅ **Lighthouse Metrics** - Google PageSpeed Insights integration for performance data
- ✅ **Firebase Authentication** - Secure user management with JWT tokens
- ✅ **Guest Mode** - Analyze websites without creating an account
- ✅ **History Tracking** - Track SEO improvements over time for authenticated users
- ✅ **Responsive Design** - Mobile-first UI with dark mode support
- ✅ **Production Ready** - Deployed on EC2 with CI/CD pipeline

---

## ✨ Features

### Core Features

#### 🔍 **SEO Analysis Engine**
- Comprehensive on-page SEO metrics extraction
- Title, meta descriptions, and heading structure analysis
- Image optimization checks (alt attributes)
- Internal/external link analysis
- Content quality metrics (word count, keyword density)
- Mobile responsiveness detection
- Canonical URL and structured data validation
- Robots.txt and sitemap detection

#### 🤖 **AI-Powered Recommendations**
- Automated analysis using Google Gemini 1.5 Flash
- Prioritized, actionable improvement suggestions
- Contextual explanations for each recommendation
- Best practices guidance

#### ⚡ **Performance Metrics**
- Google Lighthouse integration
- Performance, Accessibility, SEO, and Best Practices scores
- Page load time measurements
- Asynchronous background processing for metrics

#### 👤 **User Management**
- Firebase Authentication (Google, Email/Password)
- Guest mode for instant analysis (no signup required)
- Auto-registration on first login
- Secure JWT token-based sessions

#### 📊 **Report Management**
- Snapshot-based analysis (no cooldowns)
- Comprehensive history for authenticated users
- Exportable reports (PDF, CSV - coming soon)
- Trending analysis for tracked URLs

#### 🎨 **Modern UI/UX**
- Clean, intuitive interface built with Next.js 15
- Dark mode support with system preference detection
- Responsive design (mobile, tablet, desktop)
- Real-time analysis feedback
- Interactive charts and visualizations with ECharts

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: HeroUI (NextUI v2)
- **State Management**: React Context API
- **Charts**: Apache ECharts
- **Authentication**: Firebase Client SDK
- **HTTP Client**: Axios
- **Icons**: Tabler Icons

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Authentication**: Firebase Admin SDK
- **AI Integration**: Google Gemini 1.5 Flash (via LangChain)
- **Web Scraping**: aiohttp + BeautifulSoup4
- **Testing**: Pytest
- **Logging**: Python logging with file rotation

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Hosting**: 
  - Backend: AWS EC2
  - Frontend: Vercel
  - Database: Managed PostgreSQL
- **Version Control**: Git + GitHub
- **Registry**: GitHub Container Registry (GHCR)

---

## 📁 Project Structure

```
sitesage/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── main.py            # Application entry point
│   │   ├── config.py          # Configuration management
│   │   ├── database.py        # Database connection & session
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── firebase_auth.py   # Firebase authentication
│   │   ├── security.py        # BFF API key verification
│   │   ├── logger.py          # Logging configuration
│   │   ├── exceptions.py      # Custom exceptions
│   │   ├── api/
│   │   │   └── routes.py      # API endpoints
│   │   ├── core/
│   │   │   └── dependencies.py # Dependency injection
│   │   ├── middleware/
│   │   │   └── rate_limit.py  # Rate limiting
│   │   └── services/
│   │       ├── crawler.py     # Web crawler
│   │       ├── ai_agent.py    # AI analysis
│   │       ├── pagespeed.py   # Lighthouse metrics
│   │       ├── analyzer.py    # Main analysis orchestration
│   │       └── cleanup.py     # Guest report cleanup
│   ├── alembic/               # Database migrations
│   ├── tests/                 # Test suite
│   ├── logs/                  # Application logs
│   ├── Dockerfile             # Backend container
│   ├── requirements.txt       # Python dependencies
│   └── README.md              # Backend documentation
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── layout.tsx     # Root layout
│   │   │   ├── providers.tsx  # Context providers
│   │   │   ├── login/         # Login page
│   │   │   ├── signup/        # Signup page
│   │   │   ├── dashboard/     # User dashboard
│   │   │   ├── report/[id]/   # Report detail page
│   │   │   └── api/           # API proxy routes
│   │   ├── components/        # React components
│   │   │   ├── Navbar.tsx
│   │   │   ├── FeatureCard.tsx
│   │   │   ├── auth/          # Auth components
│   │   │   ├── charts/        # Chart components
│   │   │   ├── dashboard/     # Dashboard components
│   │   │   └── ui/            # UI components
│   │   ├── contexts/          # React contexts
│   │   │   ├── AuthContext.tsx
│   │   │   └── DashboardContext.tsx
│   │   ├── lib/               # Utilities
│   │   │   ├── api.ts         # API client
│   │   │   ├── firebase.ts    # Firebase config
│   │   │   └── cn.ts          # Class name utility
│   │   ├── services/          # Business logic
│   │   │   └── reportService.ts
│   │   └── types/             # TypeScript types
│   ├── public/                # Static assets
│   ├── Dockerfile             # Frontend container (production)
│   ├── Dockerfile.dev         # Frontend container (development)
│   ├── package.json           # Dependencies
│   └── README.md              # Frontend documentation
│
├── .github/
│   └── workflows/
│       ├── deploy.yml         # Backend deployment
│       └── ci.yml             # Continuous integration
│
├── docker-compose.yml         # Local development setup
└── README.md                  # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Docker** & **Docker Compose** (recommended)
- **Node.js** 18+ (for frontend development)
- **Python** 3.11+ (for backend development)
- **PostgreSQL** 15+ (if running without Docker)
- **Firebase Project** with Authentication enabled
- **Google API Key** (for Gemini AI and PageSpeed Insights)

### Quick Start (Docker - Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/tanishthorat/sitesage.git
   cd sitesage
   ```

2. **Set up Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication → Email/Password & Google
   - Go to Project Settings → Service Accounts → Generate New Private Key
   - Save as `backend/serviceAccountKey.json`
   - Copy your Firebase config to `frontend/.env.local` (see below)

3. **Configure Backend Environment**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit `backend/.env`:
   ```env
   # Database
   DATABASE_URL=postgresql://postgres:postgres@postgres:5432/sitesage
   
   # Security
   INTERNAL_API_KEY=your_generated_api_key_here
   
   # Google APIs
   GOOGLE_API_KEY=your_google_api_key_here
   
   # CORS
   CORS_ORIGINS=["http://localhost:3000"]
   ```

4. **Configure Frontend Environment**
   ```bash
   cd ../frontend
   cp .env.example .env.local
   ```
   
   Edit `frontend/.env.local`:
   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:8000
   INTERNAL_API_KEY=your_generated_api_key_here  # Must match backend
   
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

5. **Start all services**
   ```bash
   cd ..
   docker-compose up -d
   ```

6. **Run database migrations**
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

7. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000/docs](http://localhost:8000/docs)
   - PostgreSQL: `localhost:5432`

### Generate API Key

For BFF security pattern, generate a secure API key:

```bash
# Linux/Mac
openssl rand -hex 32

# Windows PowerShell
[System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Add the same key to both `backend/.env` and `frontend/.env.local`.

---

## 📖 API Documentation

### Base URL
- **Development**: `http://localhost:8000`
- **Production**: `https://api.sitesage.live`

### Interactive Documentation
- **Swagger UI**: `/docs`
- **ReDoc**: `/redoc`

### Authentication

All protected endpoints require:
1. **x-internal-api-key** header (BFF pattern - internal only)
2. **Authorization** header with Firebase JWT token

```bash
Authorization: Bearer <firebase_id_token>
x-internal-api-key: <your_internal_api_key>
```

### Core Endpoints

#### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information and version |
| GET | `/health` | Health check with database status |

#### SEO Analysis

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/analyze` | Optional | Analyze URL (supports guests) |

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "id": 123,
  "url": "https://example.com",
  "created_at": "2025-12-21T10:30:00Z",
  "title": "Example Domain",
  "meta_description": "Example description...",
  "h1_count": 1,
  "h2_count": 3,
  "seo_score": 85,
  "load_time": 1.25,
  "ai_summary": "Your website shows good SEO fundamentals...",
  "ai_suggestions": [
    "Add more descriptive meta description",
    "Optimize images with alt text"
  ],
  "lighthouse_performance": 92,
  "lighthouse_accessibility": 88,
  "lighthouse_seo": 95,
  "lighthouse_best_practices": 90
}
```

#### Report Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/reports` | Required | List user's reports |
| GET | `/api/v1/reports/{id}` | Optional | Get specific report |

#### History

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/history/unique` | Required | Get unique URLs analyzed |
| GET | `/api/v1/history/{url:path}` | Required | Get all reports for a URL |

### Rate Limiting

- **30 requests per minute** per IP address
- Rate limit info returned in headers:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

### Error Responses

```json
{
  "detail": "Error message description"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────┐
│   Client    │ (Browser)
│  (Next.js)  │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────────────────┐
│     Frontend (Vercel)           │
│  - Next.js 15 App Router        │
│  - Server Components            │
│  - API Proxy (BFF Pattern)      │
└──────┬──────────────────────────┘
       │ Internal API Key
       ▼
┌─────────────────────────────────┐
│     Backend API (EC2)           │
│  - FastAPI                      │
│  - Firebase Auth Validation     │
│  - Business Logic               │
└──────┬─────┬─────┬──────────────┘
       │     │     │
       │     │     └─────────────┐
       │     │                   │
       ▼     ▼                   ▼
   ┌─────────────┐    ┌──────────────────┐
   │ PostgreSQL  │    │  External APIs   │
   │  Database   │    │ - Google Gemini  │
   └─────────────┘    │ - PageSpeed API  │
                      │ - Firebase Auth  │
                      └──────────────────┘
```

### Backend Architecture

**Layered Architecture Pattern:**

1. **API Layer** (`app/api/routes.py`)
   - Endpoint definitions
   - Request validation
   - Response formatting

2. **Service Layer** (`app/services/`)
   - Business logic
   - External API integrations
   - Data processing

3. **Data Layer** (`app/models.py`, `app/database.py`)
   - Database models
   - CRUD operations
   - Connection management

4. **Security Layer** (`app/security.py`, `app/firebase_auth.py`)
   - Authentication
   - Authorization
   - API key verification

### Frontend Architecture

**Component-Based Architecture:**

1. **Pages** (`src/app/`)
   - Route definitions
   - Server components
   - Page-level logic

2. **Components** (`src/components/`)
   - Reusable UI components
   - Feature-specific components
   - Layout components

3. **Contexts** (`src/contexts/`)
   - Global state management
   - Authentication state
   - Dashboard state

4. **Services** (`src/services/`)
   - API communication
   - Business logic
   - Data fetching

### Database Schema

**Users Table:**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    firebase_uid VARCHAR UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Reports Table:**
```sql
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    url VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Basic SEO
    title VARCHAR,
    meta_description TEXT,
    h1_count INTEGER,
    h2_count INTEGER,
    image_count INTEGER,
    missing_alt_count INTEGER,
    
    -- Advanced SEO
    word_count INTEGER,
    internal_links_count INTEGER,
    external_links_count INTEGER,
    canonical_url VARCHAR,
    og_tags_present BOOLEAN,
    schema_present BOOLEAN,
    robots_txt_exists BOOLEAN,
    sitemap_exists BOOLEAN,
    top_keywords JSON,
    
    -- Performance
    load_time FLOAT,
    seo_score INTEGER,
    
    -- AI Analysis
    ai_summary TEXT,
    ai_suggestions JSON,
    
    -- Lighthouse Metrics
    lighthouse_performance FLOAT,
    lighthouse_accessibility FLOAT,
    lighthouse_seo FLOAT,
    lighthouse_best_practices FLOAT
);
```

---

## 🔒 Security

### Security Features

- ✅ **Firebase JWT Authentication** - Industry-standard token-based auth
- ✅ **BFF Pattern** - Backend-for-Frontend with internal API keys
- ✅ **SQL Injection Protection** - SQLAlchemy ORM with parameterized queries
- ✅ **XSS Protection** - Input validation with Pydantic
- ✅ **CORS Configuration** - Restricted origins
- ✅ **Rate Limiting** - IP-based throttling
- ✅ **Environment Variables** - Secure credential management
- ✅ **HTTPS Only** - TLS 1.3 in production
- ✅ **Secure Headers** - CSP, HSTS, X-Frame-Options
- ✅ **Data Isolation** - User-level authorization checks

### BFF Security Pattern

The frontend acts as a Backend-for-Frontend (BFF), proxying all API requests through Next.js API routes:

```
Client → Next.js API Route → Backend API
         (adds API key)      (validates API key)
```

This prevents exposing the internal API key to the browser.

---

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
docker-compose exec backend pytest

# Run with coverage
docker-compose exec backend pytest --cov=app --cov-report=html

# Run specific test file
docker-compose exec backend pytest tests/test_crawler.py -v

# Run with detailed output
docker-compose exec backend pytest -vv
```

**Test Coverage:**
- API endpoints (health, analyze, reports, history)
- Web crawler functionality
- SEO scoring algorithm
- Database models and queries
- Authentication flows

### Frontend Tests

```bash
cd frontend

# Run tests (when implemented)
npm test

# Run E2E tests
npm run test:e2e
```

### Manual Testing

Test the security setup:

```bash
# Linux/Mac
./test-security.sh

# Windows
./test-security.ps1
```

---

## 🚀 Deployment

### Production Deployment

The application is deployed using:
- **Backend**: AWS EC2 with Docker
- **Frontend**: Vercel
- **Database**: Managed PostgreSQL
- **CI/CD**: GitHub Actions

### Backend Deployment (EC2)

1. **Build and push Docker image**
   ```bash
   docker build -t sitesage-backend backend/
   docker push ghcr.io/yourusername/sitesage-backend:latest
   ```

2. **SSH into EC2 and deploy**
   ```bash
   ssh ubuntu@your-ec2-instance
   
   # Pull latest image
   docker pull ghcr.io/yourusername/sitesage-backend:latest
   
   # Stop and remove old container
   docker stop api-server
   docker rm api-server
   
   # Run new container
   docker run -d \
     --name api-server \
     --restart always \
     -p 8000:8000 \
     --network sitesage-net \
     --env-file /home/ubuntu/sitesage/.env \
     -v /home/ubuntu/sitesage/backend/serviceAccountKey.json:/app/serviceAccountKey.json:ro \
     ghcr.io/yourusername/sitesage-backend:latest
   ```

3. **Verify deployment**
   ```bash
   docker logs api-server --tail 50
   curl http://localhost:8000/health
   ```

### Frontend Deployment (Vercel)

1. **Connect GitHub repository to Vercel**
2. **Configure environment variables** in Vercel dashboard
3. **Deploy automatically** on push to main branch

### Environment Variables for Production

**Backend (.env):**
```env
ENVIRONMENT=production
DEBUG=False
DATABASE_URL=postgresql://user:pass@host:5432/dbname
INTERNAL_API_KEY=<secure-key>
GOOGLE_API_KEY=<your-key>
CORS_ORIGINS=["https://www.sitesage.live"]
```

**Frontend (.env.local on Vercel):**
```env
NEXT_PUBLIC_API_URL=https://api.sitesage.live
INTERNAL_API_KEY=<same-as-backend>
NEXT_PUBLIC_FIREBASE_API_KEY=<your-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-domain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-project>
# ... other Firebase config
```

### Continuous Deployment

GitHub Actions workflow automatically:
1. Runs tests on pull requests
2. Builds Docker image on push to main
3. Pushes image to GHCR
4. Deploys to EC2 via SSH

---

## 📝 Development

### Local Development Setup

**Backend:**
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Code Style

**Backend:**
- Follow PEP 8 style guide
- Use type hints
- Document functions with docstrings
- Format with `black` and `isort`

**Frontend:**
- Follow ESLint rules
- Use TypeScript strict mode
- Document components with JSDoc
- Format with Prettier

### Database Migrations

```bash
# Create new migration
docker-compose exec backend alembic revision --autogenerate -m "description"

# Apply migrations
docker-compose exec backend alembic upgrade head

# Rollback migration
docker-compose exec backend alembic downgrade -1

# View history
docker-compose exec backend alembic history
```

---

## 📚 Documentation

- **[Backend README](backend/README.md)** - Detailed backend documentation
- **[Frontend README](frontend/README.md)** - Frontend setup and development
- **[API Documentation](https://api.sitesage.live/docs)** - Interactive API docs
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
- **[.github/workflows/](. github/workflows/)** - CI/CD configuration

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Pull Request Guidelines

- Ensure all tests pass
- Update documentation as needed
- Follow code style guidelines
- Add tests for new features
- Keep PRs focused and atomic

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Tanish Thorat**
- Website: [tanishdev.me](https://tanishdev.me)
- GitHub: [@tanish0019](https://github.com/tanish0019)
- Email: tanishthorat02@gmail.com

---

## 🙏 Acknowledgments

- **FastAPI** - Modern Python web framework
- **Next.js** - React framework for production
- **Firebase** - Authentication and backend services
- **Google Gemini** - AI-powered insights
- **PostgreSQL** - Robust database solution
- **Vercel** - Frontend hosting platform
- **AWS** - Cloud infrastructure

---

## 📊 Project Status

**Status**: ✅ Production Ready  
**Version**: 1.0.1  
**Last Updated**: December 21, 2025  
**Live**: [https://www.sitesage.live](https://www.sitesage.live)

---

## 🗺️ Roadmap

- [ ] Export reports as PDF
- [ ] Competitive analysis feature
- [ ] Scheduled monitoring and alerts
- [ ] Chrome extension
- [ ] API rate plan tiers
- [ ] White-label solution
- [ ] Multi-language support

---

**Made with ❤️ for better SEO**
