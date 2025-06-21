# Email Template Generator

A comprehensive email template management system built for hackathons and rapid prototyping. This project allows users to generate email templates based on purpose, generate response emails using AI, and translate emails to different languages.

## Features

- **Template Management**: Create, read, update, and delete email templates
- **AI-Powered Generation**: Generate emails based on purpose, context, and tone
- **Multi-language Translation**: Translate emails to different languages
- **Modern UI**: Clean and responsive React/TypeScript frontend
- **RESTful API**: FastAPI backend with comprehensive endpoints
- **Database**: PostgreSQL for reliable data storage
- **Containerized**: Full Docker support for easy deployment

## Tech Stack

### Backend
- **FastAPI**: Modern, fast Python web framework
- **PostgreSQL**: Robust relational database
- **SQLAlchemy**: Python SQL toolkit and ORM
- **Pydantic**: Data validation using Python type annotations

### Frontend
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe JavaScript
- **Styled Components**: CSS-in-JS styling
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls

### Infrastructure
- **Docker**: Containerization for all services
- **Docker Compose**: Multi-container orchestration

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git

### Setup and Run

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd AI-Hackathon-Session-1
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Development

### Project Structure
```
├── backend/                 # FastAPI backend
│   ├── models/             # Database models
│   ├── schemas/            # Pydantic schemas
│   ├── routers/            # API route handlers
│   ├── main.py             # FastAPI application
│   ├── database.py         # Database configuration
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # Backend container
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Main app component
│   ├── package.json        # Node dependencies
│   └── Dockerfile          # Frontend container
├── docker-compose.yml      # Multi-container orchestration
└── README.md              # This file
```

### API Endpoints

#### Email Templates
- `GET /api/v1/email-templates` - Get all templates
- `GET /api/v1/email-templates/{id}` - Get template by ID
- `POST /api/v1/email-templates` - Create new template
- `PUT /api/v1/email-templates/{id}` - Update template
- `DELETE /api/v1/email-templates/{id}` - Delete template

#### Email Generation & Translation
- `POST /api/v1/email-templates/generate` - Generate email content
- `POST /api/v1/email-templates/translate` - Translate email content

### Database Schema

#### Email Templates Table
```sql
- id (Primary Key)
- title (String, 255 chars)
- subject (String, 500 chars)
- content (Text)
- purpose (String, 100 chars)
- language (String, 10 chars, default: 'en')
- is_active (Boolean, default: true)
- created_at (Timestamp)
- updated_at (Timestamp)
```

## Development Notes

This is a base project setup designed for hackathons. Key features to implement:

### Backend TODOs
- [ ] Integrate AI service for email generation (OpenAI, etc.)
- [ ] Implement translation service (Google Translate, etc.)
- [ ] Add email validation and sanitization
- [ ] Implement caching for frequent requests
- [ ] Add rate limiting and security measures

### Frontend TODOs
- [ ] Implement template management UI
- [ ] Build email generation form
- [ ] Create translation interface
- [ ] Add email preview functionality
- [ ] Implement error handling and loading states
- [ ] Add responsive design improvements

### Infrastructure TODOs
- [ ] Add environment-specific configurations
- [ ] Implement logging and monitoring
- [ ] Add health checks for all services
- [ ] Set up CI/CD pipeline
- [ ] Add backup and recovery procedures

## Contributing

This is a hackathon project designed for rapid development. Feel free to:
- Add new features
- Improve existing functionality
- Enhance the UI/UX
- Optimize performance
- Add tests

## License

This project is open source and available under the MIT License.