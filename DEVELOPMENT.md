# Email Generator Development Guide

## Project Structure Overview

```
email-generator/
├── backend/                 # FastAPI Backend
│   ├── models/             # SQLAlchemy Database Models
│   ├── schemas/            # Pydantic Request/Response Schemas
│   ├── routers/            # API Route Handlers
│   ├── main.py             # FastAPI Application Entry Point
│   ├── database.py         # Database Configuration
│   └── init.sql           # Database Initialization Script
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable React Components
│   │   ├── pages/          # Page-level Components
│   │   ├── services/       # API Communication Layer
│   │   ├── types/          # TypeScript Type Definitions
│   │   └── App.tsx         # Main Application Component
│   └── public/             # Static Assets
└── docker-compose.yml      # Multi-service Orchestration
```

## Development Workflow

### 1. Initial Setup
```bash
# Clone and setup
git clone <repo-url>
cd AI-Hackathon-Session-1

# Quick start
docker-compose up --build
```

### 2. Development Commands

#### Start All Services
```bash
docker-compose up --build
```

#### Start Individual Services
```bash
# Backend only
docker-compose up backend db

# Frontend only (after backend is running)
docker-compose up frontend
```

#### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

#### Stop Services
```bash
docker-compose down
```

#### Clean Up (Remove volumes)
```bash
docker-compose down -v
```

### 3. API Development

#### Available Endpoints
- **Health Check**: `GET /health`
- **API Documentation**: `GET /docs` (Swagger UI)
- **Email Templates**: `GET|POST|PUT|DELETE /api/v1/email-templates`
- **Generate Email**: `POST /api/v1/email-templates/generate`
- **Translate Email**: `POST /api/v1/email-templates/translate`

#### Testing API Endpoints
```bash
# Health check
curl http://localhost:8000/health

# Get all templates
curl http://localhost:8000/api/v1/email-templates

# Create new template
curl -X POST http://localhost:8000/api/v1/email-templates \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Template",
    "subject": "Test Subject",
    "content": "Test content",
    "purpose": "business"
  }'
```

### 4. Frontend Development

#### Key Files to Modify
- `src/pages/`: Add new page components
- `src/components/`: Add reusable components
- `src/services/api.ts`: Modify API calls
- `src/types/index.ts`: Add TypeScript types

#### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/Header.tsx`

### 5. Database Operations

#### Connect to Database
```bash
# Access PostgreSQL container
docker-compose exec db psql -U postgres -d email_generator

# View tables
\dt

# Query templates
SELECT * FROM email_templates;
```

#### Reset Database
```bash
docker-compose down -v
docker-compose up --build
```

## Implementation Priorities

### Phase 1: Core Functionality
1. **Template Management UI**
   - List templates
   - Create/Edit templates
   - Delete templates

2. **Basic Email Generation**
   - Simple form input
   - Static template generation
   - Preview functionality

### Phase 2: AI Integration
1. **AI Email Generation**
   - Integrate OpenAI API
   - Context-aware generation
   - Multiple tone options

2. **Translation Service**
   - Integrate translation API
   - Language detection
   - Bulk translation

### Phase 3: Enhancement
1. **Advanced Features**
   - Template categories
   - Search and filtering
   - Export functionality

2. **UI/UX Improvements**
   - Better responsive design
   - Loading states
   - Error handling

## Common Issues & Solutions

### Docker Issues
```bash
# Port already in use
docker-compose down
# Check for running containers
docker ps -a

# Permission issues (Linux/Mac)
sudo docker-compose up --build

# Build cache issues
docker-compose build --no-cache
```

### Frontend Issues
```bash
# Node modules issues
docker-compose exec frontend npm install

# TypeScript errors
# Check types in src/types/index.ts
```

### Backend Issues
```bash
# Python dependency issues
docker-compose exec backend pip install -r requirements.txt

# Database connection issues
# Check DATABASE_URL in .env file
```

## Useful Commands

### Development
```bash
# Install new frontend dependency
docker-compose exec frontend npm install <package-name>

# Install new backend dependency
docker-compose exec backend pip install <package-name>
# Don't forget to update requirements.txt

# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh
```

### Production
```bash
# Build for production
docker-compose -f docker-compose.prod.yml up --build

# Environment variables
# Create .env.production with production values
```

## Next Steps

1. **Choose AI Service**: OpenAI, Anthropic, or local models
2. **Select Translation Service**: Google Translate, Azure Translator
3. **Implement Authentication**: If required for hackathon
4. **Add Logging**: For debugging and monitoring
5. **Write Tests**: Unit tests for critical functionality

## Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **React Documentation**: https://react.dev/
- **SQLAlchemy Documentation**: https://docs.sqlalchemy.org/
- **Docker Compose Documentation**: https://docs.docker.com/compose/
