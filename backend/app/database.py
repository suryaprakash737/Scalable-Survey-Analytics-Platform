"""
Database configuration and session management for Student Survey application.
Handles MySQL connection setup and provides database session management using SQLModel/SQLAlchemy.
"""
from sqlmodel import SQLModel, create_engine, Session
import os

# Database URL from environment variable or default
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:password@mysql-service:3306/survey_db"
)

# Create engine
engine = create_engine(DATABASE_URL, echo=True)

def init_db():
    """Initialize database tables."""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Get database session."""
    with Session(engine) as session:
        yield session



