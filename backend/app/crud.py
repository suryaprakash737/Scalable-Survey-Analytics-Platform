"""
CRUD operations module for Survey model.
Provides database functions to create, read, update, and delete survey records.
"""
from sqlmodel import Session, select
from typing import List, Optional
from app.models import Survey, SurveyCreate, SurveyUpdate

def create_survey(session: Session, survey: SurveyCreate) -> Survey:
    """Create a new survey in the database."""
    db_survey = Survey(**survey.dict())
    session.add(db_survey)
    session.commit()
    session.refresh(db_survey)
    return db_survey

def get_survey(session: Session, survey_id: int) -> Optional[Survey]:
    """Get a survey by ID."""
    return session.get(Survey, survey_id)

def get_all_surveys(session: Session) -> List[Survey]:
    """Get all surveys from the database."""
    statement = select(Survey)
    return session.exec(statement).all()

def update_survey(session: Session, survey_id: int, survey_update: SurveyUpdate) -> Optional[Survey]:
    """Update a survey by ID."""
    db_survey = session.get(Survey, survey_id)
    if not db_survey:
        return None
    
    survey_data = survey_update.dict(exclude_unset=True)
    for field, value in survey_data.items():
        setattr(db_survey, field, value)
    
    session.add(db_survey)
    session.commit()
    session.refresh(db_survey)
    return db_survey

def delete_survey(session: Session, survey_id: int) -> bool:
    """Delete a survey by ID."""
    db_survey = session.get(Survey, survey_id)
    if not db_survey:
        return False
    
    session.delete(db_survey)
    session.commit()
    return True



