"""
Main FastAPI application entry point for Student Survey backend.
Provides REST API endpoints for CRUD operations on survey data.
"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from typing import List
from app.database import init_db, get_session
from app.models import Survey, SurveyCreate, SurveyRead, SurveyUpdate
from app.crud import (
    create_survey,
    get_survey,
    get_all_surveys,
    update_survey,
    delete_survey
)

# Initialize FastAPI app
app = FastAPI(
    title="Student Survey API",
    description="REST API for managing student survey data",
    version="1.0.0"
)

# Configure CORS
# Allow requests from frontend service and localhost for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:80",
        "http://frontend-service",
        "*"  # In production, specify actual frontend URLs
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def on_startup():
    """Initialize database tables on application startup."""
    init_db()

@app.get("/")
def root():
    """Root endpoint."""
    return {"message": "Student Survey API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

@app.post("/api/surveys", response_model=SurveyRead, status_code=status.HTTP_201_CREATED)
def create_survey_endpoint(survey: SurveyCreate, session: Session = Depends(get_session)):
    """Create a new survey."""
    return create_survey(session, survey)

@app.get("/api/surveys", response_model=List[SurveyRead])
def get_all_surveys_endpoint(session: Session = Depends(get_session)):
    """Get all surveys."""
    return get_all_surveys(session)

@app.get("/api/surveys/{survey_id}", response_model=SurveyRead)
def get_survey_endpoint(survey_id: int, session: Session = Depends(get_session)):
    """Get a specific survey by ID."""
    survey = get_survey(session, survey_id)
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Survey with ID {survey_id} not found"
        )
    return survey

@app.put("/api/surveys/{survey_id}", response_model=SurveyRead)
def update_survey_endpoint(
    survey_id: int,
    survey_update: SurveyUpdate,
    session: Session = Depends(get_session)
):
    """Update a specific survey by ID."""
    survey = update_survey(session, survey_id, survey_update)
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Survey with ID {survey_id} not found"
        )
    return survey

@app.delete("/api/surveys/{survey_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_survey_endpoint(survey_id: int, session: Session = Depends(get_session)):
    """Delete a specific survey by ID."""
    success = delete_survey(session, survey_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Survey with ID {survey_id} not found"
        )
    return None

