import asyncio
from sqlalchemy.ext.asyncio import AsyncEngine
from app.core.database import Base
from app.db.session import engine
from app.models.user import User  # Import all models to register them
from app.models.patient import Patient, VitalSigns, RiskAssessment, MedicalRecord

async def init_db() -> None:
    """Initialize the database, creating all tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

if __name__ == "__main__":
    asyncio.run(init_db()) 