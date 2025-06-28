from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from database import engine, Base
from routers import email_templates, email_assistant
from models import conversation, email_template  # Import models to register them


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Email Generator API",
    description="API for generating, translating, and managing email templates",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(email_templates.router, prefix="/api/v1", tags=["email-templates"])
app.include_router(email_assistant.router, prefix="/api/v1", tags=["email-assistant"])


@app.get("/")
async def root():
    return {"message": "Email Generator API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
