from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    vital_signs,
    risk_assessments,
    medical_records,
    patients
)

# Create API router with version prefix
api_router = APIRouter()

# Include routers from different modules with their own tags and prefixes
api_router.include_router(
    auth.router, 
    prefix="/auth", 
    tags=["authentication"]
)

api_router.include_router(
    patients.router,
    prefix="/patients",
    tags=["patients"]
)

api_router.include_router(
    vital_signs.router,
    prefix="/patients",
    tags=["vital signs"]
)

api_router.include_router(
    risk_assessments.router,
    prefix="/patients",
    tags=["risk assessments"]
)

api_router.include_router(
    medical_records.router,
    prefix="/patients",
    tags=["medical records"]
)
