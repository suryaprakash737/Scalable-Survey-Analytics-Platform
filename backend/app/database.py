# database.py
# Database Configuration and Connection
# Author: Suryaprakash
        # Jaya Krishna
        # Karthik Reddy
# Description: Database setup and connection management for SQLModel

import os
from sqlmodel import create_engine, SQLModel, Session
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:password@mysql-service:3306/survey_db"
)

# For local development, you might use:
# DATABASE_URL = "mysql+pymysql://root:password@localhost:3306/survey_db"

# Create database engine
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Set to False in production
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

def create_db_and_tables():
    """Create database tables"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Get database session"""
    with Session(engine) as session:
        yield session