"""
Database models for Student Survey application using SQLModel.
Defines the Survey model with all required fields and validation enums.
"""
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
from typing import Optional, List
from datetime import date
from enum import Enum

class LikedMost(str, Enum):
    """Enum for what student liked most about campus."""
    students = "students"
    location = "location"
    campus = "campus"
    atmosphere = "atmosphere"
    dorm_rooms = "dorm rooms"
    sports = "sports"

class InterestedIn(str, Enum):
    """Enum for how student became interested in university."""
    friends = "friends"
    television = "television"
    internet = "Internet"
    other = "other"

class Recommendation(str, Enum):
    """Enum for likelihood of recommendation."""
    very_likely = "Very Likely"
    likely = "Likely"
    unlikely = "Unlikely"

class SurveyBase(SQLModel):
    """Base model for Survey with all required fields."""
    first_name: str = Field(..., min_length=1, description="First name of the student")
    last_name: str = Field(..., min_length=1, description="Last name of the student")
    street_address: str = Field(..., min_length=1, description="Street address")
    city: str = Field(..., min_length=1, description="City")
    state: str = Field(..., min_length=1, description="State")
    zip: str = Field(..., min_length=5, description="ZIP code")
    telephone: str = Field(..., min_length=10, description="Telephone number")
    email: str = Field(..., description="Email address")
    date_of_survey: date = Field(..., description="Date of survey")
    liked_most: List[str] = Field(..., sa_column=Column(JSON), description="What they liked most (students, location, campus, atmosphere, dorm rooms, sports) - multiple selections allowed")
    interested_in: InterestedIn = Field(..., description="How they became interested (friends, television, Internet, other)")
    recommendation: Recommendation = Field(..., description="Likelihood of recommendation (Very Likely, Likely, Unlikely)")

class Survey(SurveyBase, table=True):
    """Survey model for database table."""
    __tablename__ = "surveys"
    
    id: Optional[int] = Field(default=None, primary_key=True)

class SurveyCreate(SurveyBase):
    """Model for creating a new survey."""
    pass

class SurveyRead(SurveyBase):
    """Model for reading survey data."""
    id: int

class SurveyUpdate(SQLModel):
    """Model for updating survey data (all fields optional)."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    street_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip: Optional[str] = None
    telephone: Optional[str] = None
    email: Optional[str] = None
    date_of_survey: Optional[date] = None
    liked_most: Optional[List[str]] = None
    interested_in: Optional[InterestedIn] = None
    recommendation: Optional[Recommendation] = None



