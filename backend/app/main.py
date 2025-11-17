# main.py
# FastAPI Backend Application for Student Survey
# Author: Suryaprakash
        # Jaya Krishna
        # Karthik Reddy
# Description: REST API endpoints for managing student surveys with CRUD operations

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from typing import List
from contextlib import asynccontextmanager

from .database import create_db_and_tables, get_session
from .models import Survey, SurveyCreate, SurveyUpdate
from . import crud

# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Creating database tables...")
    create_db_and_tables()
    yield
    # Shutdown
    print("Shutting down...")

# Create FastAPI app
app = FastAPI(
    title="Student Survey API",
    description="API for managing student campus visit surveys",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
def read_root():
    """Root endpoint - API health check"""
    return {
        "message": "Student Survey API",
        "status": "active",
        "version": "1.0.0"
    }

# Health check endpoint
@app.get("/health")
def health_check():
    """Health check endpoint for Kubernetes"""
    return {"status": "healthy"}

# Create a new survey
@app.post("/api/surveys/", response_model=Survey, status_code=status.HTTP_201_CREATED)
def create_survey_endpoint(
    survey: SurveyCreate,
    session: Session = Depends(get_session)
):
    """Create a new student survey"""
    # Validate likelihood value
    valid_likelihood = ["Very Likely", "Likely", "Unlikely"]
    if survey.likelihood not in valid_likelihood:
        raise HTTPException(
            status_code=400,
            detail=f"Likelihood must be one of: {', '.join(valid_likelihood)}"
        )
    
    # Validate liked_most options
    valid_liked = ["students", "location", "campus", "atmosphere", "dorm_rooms", "sports"]
    for item in survey.liked_most:
        if item not in valid_liked:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid liked_most option: {item}"
            )
    
    # Validate interested_how options
    valid_interested = ["friends", "television", "internet", "other"]
    for item in survey.interested_how:
        if item not in valid_interested:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid interested_how option: {item}"
            )
    
    return crud.create_survey(session, survey)

# Get all surveys
@app.get("/api/surveys/", response_model=List[Survey])
def read_surveys(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session)
):
    """Get all surveys with optional pagination"""
    return crud.get_surveys(session, skip=skip, limit=limit)

# Get a specific survey
@app.get("/api/surveys/{survey_id}", response_model=Survey)
def read_survey(
    survey_id: int,
    session: Session = Depends(get_session)
):
    """Get a specific survey by ID"""
    survey = crud.get_survey(session, survey_id)
    if not survey:
        raise HTTPException(
            status_code=404,
            detail=f"Survey with ID {survey_id} not found"
        )
    return survey

# Update a survey
@app.put("/api/surveys/{survey_id}", response_model=Survey)
def update_survey_endpoint(
    survey_id: int,
    survey_update: SurveyUpdate,
    session: Session = Depends(get_session)
):
    """Update an existing survey"""
    # Validate fields if provided
    if survey_update.likelihood:
        valid_likelihood = ["Very Likely", "Likely", "Unlikely"]
        if survey_update.likelihood not in valid_likelihood:
            raise HTTPException(
                status_code=400,
                detail=f"Likelihood must be one of: {', '.join(valid_likelihood)}"
            )
    
    updated_survey = crud.update_survey(session, survey_id, survey_update)
    if not updated_survey:
        raise HTTPException(
            status_code=404,
            detail=f"Survey with ID {survey_id} not found"
        )
    return updated_survey

# Delete a survey
@app.delete("/api/surveys/{survey_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_survey_endpoint(
    survey_id: int,
    session: Session = Depends(get_session)
):
    """Delete a survey"""
    success = crud.delete_survey(session, survey_id)
    if not success:
        raise HTTPException(
            status_code=404,
            detail=f"Survey with ID {survey_id} not found"
        )
    return None

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)