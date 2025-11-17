# crud.py
# CRUD Operations for Survey Management
# Author: Suryaprakash
        # Jaya Krishna
        # Karthik Reddy
# Description: Database operations for creating, reading, updating, and deleting surveys

from typing import List, Optional
from sqlmodel import Session, select
from .models import Survey, SurveyCreate, SurveyUpdate

def create_survey(session: Session, survey: SurveyCreate) -> Survey:
    """Create a new survey"""
    db_survey = Survey(**survey.dict())
    session.add(db_survey)
    session.commit()
    session.refresh(db_survey)
    return db_survey

def get_surveys(session: Session, skip: int = 0, limit: int = 100) -> List[Survey]:
    """Get all surveys with pagination"""
    statement = select(Survey).offset(skip).limit(limit)
    results = session.exec(statement)
    return results.all()

def get_survey(session: Session, survey_id: int) -> Optional[Survey]:
    """Get a specific survey by ID"""
    statement = select(Survey).where(Survey.id == survey_id)
    result = session.exec(statement)
    return result.first()

def update_survey(session: Session, survey_id: int, survey_update: SurveyUpdate) -> Optional[Survey]:
    """Update an existing survey"""
    db_survey = get_survey(session, survey_id)
    if not db_survey:
        return None
    
    update_data = survey_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_survey, key, value)
    
    session.add(db_survey)
    session.commit()
    session.refresh(db_survey)
    return db_survey

def delete_survey(session: Session, survey_id: int) -> bool:
    """Delete a survey"""
    db_survey = get_survey(session, survey_id)
    if not db_survey:
        return False
    
    session.delete(db_survey)
    session.commit()
    return True