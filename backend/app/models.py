# models.py
# Student Survey Data Models
# Author: Suryaprakash
        # Jaya Krishna
        # Karthik Reddy
# Description: SQLModel database models for student survey application

from typing import Optional, List
from datetime import date
from sqlmodel import Field, SQLModel, JSON, Column
from enum import Enum

class LikelihoodEnum(str, Enum):
    VERY_LIKELY = "Very Likely"
    LIKELY = "Likely"
    UNLIKELY = "Unlikely"

class Survey(SQLModel, table=True):
    """Student Survey Model representing survey data"""
    __tablename__ = "surveys"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Required fields
    first_name: str = Field(nullable=False)
    last_name: str = Field(nullable=False)
    street_address: str = Field(nullable=False)
    city: str = Field(nullable=False)
    state: str = Field(max_length=2, nullable=False)
    zip_code: str = Field(max_length=10, nullable=False)
    telephone: str = Field(max_length=20, nullable=False)
    email: str = Field(nullable=False)
    survey_date: date = Field(nullable=False)
    
    # Multiple choice fields (stored as JSON arrays)
    liked_most: List[str] = Field(default=[], sa_column=Column(JSON))
    # Options: students, location, campus, atmosphere, dorm_rooms, sports
    
    interested_how: List[str] = Field(default=[], sa_column=Column(JSON))
    # Options: friends, television, internet, other
    
    likelihood: str = Field(nullable=False)
    # Options: Very Likely, Likely, Unlikely
    
    class Config:
        schema_extra = {
            "example": {
                "first_name": "John",
                "last_name": "Doe",
                "street_address": "123 Main St",
                "city": "Fairfax",
                "state": "VA",
                "zip_code": "22030",
                "telephone": "703-555-1234",
                "email": "john.doe@example.com",
                "survey_date": "2024-11-01",
                "liked_most": ["campus", "students"],
                "interested_how": ["friends", "internet"],
                "likelihood": "Very Likely"
            }
        }

class SurveyCreate(SQLModel):
    """Schema for creating a new survey"""
    first_name: str
    last_name: str
    street_address: str
    city: str
    state: str
    zip_code: str
    telephone: str
    email: str
    survey_date: date
    liked_most: List[str] = []
    interested_how: List[str] = []
    likelihood: str

class SurveyUpdate(SQLModel):
    """Schema for updating an existing survey"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    street_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    telephone: Optional[str] = None
    email: Optional[str] = None
    survey_date: Optional[date] = None
    liked_most: Optional[List[str]] = None
    interested_how: Optional[List[str]] = None
    likelihood: Optional[str] = None