# Email Wizard - AI-Powered Email Assistant

A sophisticated AI-powered email assistant that helps you create professional emails through natural conversation. Built with modern technologies and featuring an intelligent chat interface, template management, and multi-language support.

## 🌟 Features

### 🤖 AI Email Assistant
- **Conversational Interface**: Natural language chat for email creation
- **Smart Extraction**: Automatically extracts recipient, purpose, tone, and context from conversations
- **Follow-up Questions**: Intelligent prompts to gather missing information
- **Email Confirmation**: Review and edit extracted details before generation
- **Email Revision**: Request changes and improvements to generated emails
- **Real-time Chat**: Responsive chat interface with message history

### 📝 Email Management
- **Template Library**: Pre-built professional email templates
- **Email Generation**: AI-powered email creation based on context
- **Multi-language Support**: Generate emails in multiple languages
- **Tone Selection**: Choose from professional, friendly, formal, casual, urgent, apologetic, or persuasive tones
- **Email Preview**: Review generated emails before use

### 🔧 Advanced Features
- **User-Friendly Forms**: Intuitive email details confirmation with quick-add buttons
- **Smart Additional Info**: Contextual information handling with helpful templates
- **Responsive Design**: Modern, mobile-friendly interface
- **Real-time Validation**: Instant feedback and error handling
- **Message History**: Persistent conversation storage

## 🛠 Tech Stack

### Backend
- **FastAPI**: Modern, high-performance Python web framework
- **PostgreSQL**: Robust relational database with ACID compliance
- **SQLAlchemy**: Advanced ORM with relationship mapping
- **Pydantic**: Data validation and serialization
- **AI Integration**: Intelligent email processing and generation

### Frontend
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development with enhanced IDE support
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: High-quality, accessible component library
- **Radix UI**: Unstyled, accessible UI primitives
- **Lucide React**: Beautiful, customizable icons
- **React Query**: Powerful data fetching and state management
- **React Router**: Client-side routing and navigation

### Infrastructure
- **Docker**: Containerized development and deployment
- **Docker Compose**: Multi-service orchestration
- **Nginx**: Production-ready web server and reverse proxy
- **Database Migrations**: Automated schema management

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd AI-Hackathon-Session-1
   ```

2. **Start the application:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - **Frontend**: http://localhost (main application)
   - **Backend API**: http://localhost:8000 (API endpoints)
   - **API Documentation**: http://localhost:8000/docs (Swagger UI)

The application will automatically:
- Set up the PostgreSQL database
- Run database migrations
- Start the FastAPI backend
- Launch the React frontend
- Configure nginx for production-ready serving

## 📱 User Interface

### AI Assistant Tab
- **Chat Interface**: Natural conversation with the AI assistant
- **Message Bubbles**: User and assistant messages with timestamps
- **Follow-up Questions**: Quick response buttons for common queries
- **Details Panel**: Real-time display of extracted email information
- **Confirmation Form**: Review and edit email details before generation
- **Email Preview**: View and revise generated emails

### Additional Tabs
- **Generate**: Template-based email generation
- **Respond**: Generate responses to existing emails
- **Translate**: Multi-language email translation
- **Templates**: Manage email template library

## 🏗 Project Structure
```
├── backend/                     # FastAPI backend
│   ├── models/
│   │   ├── conversation.py      # Chat conversation models
│   │   ├── message.py          # Individual message storage
│   │   └── email_template.py   # Email template models
│   ├── schemas/
│   │   ├── email_assistant.py   # AI assistant schemas
│   │   └── email_template.py    # Template schemas
│   ├── routers/
│   │   ├── email_assistant.py   # AI chat endpoints
│   │   └── email_templates.py   # Template management
│   ├── services/
│   │   └── email_assistant_ai.py # AI processing logic
│   ├── common/
│   │   ├── email_assistant_ai.py # AI utilities
│   │   └── email_templates_common.py # Shared functions
│   ├── main.py                  # FastAPI application
│   ├── database.py              # Database configuration
│   └── init.sql                 # Database initialization
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── EmailAssistant.tsx # Main chat interface
│   │   │   ├── EmailDetailsConfirmation.tsx # Form component
│   │   │   ├── EmailPreview.tsx # Email preview component
│   │   │   └── ui/              # Reusable UI components
│   │   ├── services/
│   │   │   ├── emailAssistantApi.ts # AI assistant API
│   │   │   └── emailApi.ts      # Template API
│   │   ├── pages/
│   │   │   └── Index.tsx        # Main application page
│   │   └── App.tsx              # Root component
│   └── package.json             # Dependencies and scripts
├── docker-compose.yml           # Service orchestration
└── README.md                   # Documentation
```

## 🔌 API Endpoints

### AI Email Assistant
- `POST /api/v1/assistant/new-conversation` - Start new conversation
- `POST /api/v1/assistant/chat` - Send message to AI assistant
- `POST /api/v1/assistant/confirm-and-generate` - Generate email from confirmed details
- `POST /api/v1/assistant/revise` - Request email revision
- `GET /api/v1/assistant/conversation/{id}` - Get conversation history
- `GET /api/v1/assistant/details/{id}` - Get email details

### Email Templates
- `GET /api/v1/email-templates` - List all templates
- `GET /api/v1/email-templates/{id}` - Get specific template
- `POST /api/v1/email-templates` - Create new template
- `PUT /api/v1/email-templates/{id}` - Update template
- `DELETE /api/v1/email-templates/{id}` - Delete template
- `POST /api/v1/email-templates/generate` - Generate email from template
- `POST /api/v1/email-templates/translate` - Translate email content

## 💾 Database Schema

### Conversations Table
```sql
- id (Primary Key)
- conversation_id (Unique String, 255 chars)
- user_message (Text)
- assistant_response (Text)
- extracted_details (JSON)
- status (String, 50 chars)
- created_at (Timestamp)
- updated_at (Timestamp)
```

### Messages Table
```sql
- id (Primary Key)
- conversation_id (String, 255 chars)
- message_type (String: 'user' | 'assistant')
- content (Text)
- created_at (Timestamp)
```

### Email Details Table
```sql
- id (Primary Key)
- conversation_id (String, 255 chars)
- recipient (String, 255 chars)
- purpose (String, 255 chars)
- tone (String, 100 chars)
- language (String, 10 chars)
- context (Text)
- additional_info (JSON)
- generated_email (JSON)
- is_confirmed (Boolean)
- created_at (Timestamp)
- updated_at (Timestamp)
```

### Email Templates Table
```sql
- id (Primary Key)
- title (String, 255 chars)
- subject (String, 500 chars)
- content (Text)
- purpose (String, 100 chars)
- language (String, 10 chars)
- is_active (Boolean)
- created_at (Timestamp)
- updated_at (Timestamp)
```

## 🎯 Key Improvements Implemented

### User Experience
- ✅ **Responsive Chat Interface**: Properly sized within tab container
- ✅ **User-Friendly Forms**: Enhanced email details confirmation with guided input
- ✅ **Quick-Add Buttons**: Time, Location, Deadline, Contact shortcuts
- ✅ **Smart Placeholders**: Helpful examples and formatting guidance
- ✅ **Visual Feedback**: Icons, progress indicators, and contextual help
- ✅ **Error Handling**: Comprehensive validation and user feedback

### Technical Enhancements
- ✅ **Database Optimization**: Proper indexing and relationship management
- ✅ **API Robustness**: Enhanced error handling and validation
- ✅ **Type Safety**: Full TypeScript integration
- ✅ **Data Consistency**: Proper serialization between frontend and backend
- ✅ **Performance**: Optimized queries and efficient state management

### AI Features
- ✅ **Intelligent Extraction**: Smart parsing of user intent and details
- ✅ **Contextual Follow-ups**: Dynamic question generation
- ✅ **Conversation Memory**: Persistent chat history
- ✅ **Email Revision**: Iterative improvement workflow
- ✅ **Multi-language Support**: Global email generation

## 🔮 Future Enhancements

### Planned Features
- [ ] **Email Templates AI**: AI-powered template suggestions
- [ ] **Email Scheduling**: Schedule emails for later sending
- [ ] **Email Analytics**: Track email performance and engagement
- [ ] **Team Collaboration**: Multi-user workspaces
- [ ] **Integration APIs**: Connect with popular email clients
- [ ] **Advanced AI**: GPT-4 integration and custom models

### Technical Improvements
- [ ] **Real-time Updates**: WebSocket support for live collaboration
- [ ] **Offline Support**: PWA capabilities and offline functionality
- [ ] **Performance Monitoring**: Application insights and metrics
- [ ] **Security Enhancements**: OAuth integration and encryption
- [ ] **Mobile App**: React Native companion app

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure Docker compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Hackathon Ready

This project is specifically designed for hackathons and rapid prototyping:
- **Quick Setup**: One-command deployment with Docker
- **Modern Stack**: Latest technologies and best practices
- **Extensible Architecture**: Easy to add new features
- **Production Ready**: Scalable and maintainable codebase
- **Well Documented**: Comprehensive documentation and examples

---

Built with ❤️ for the AI Hackathon Session 1