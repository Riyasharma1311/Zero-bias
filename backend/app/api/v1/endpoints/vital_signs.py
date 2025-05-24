from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime, timedelta

from app.api.deps import get_db, get_doctor_user, get_admin_user, get_current_active_user
from app.models.user import User
from app.models.patient import Patient, VitalSigns
from app.schemas.patient import (
    VitalSigns as VitalSignsSchema,
    VitalSignsCreate,
    VitalSignsUpdate
)
from app.db.session import get_by_id, get_all, create, update_by_id, delete_by_id

router = APIRouter()


@router.post("/{patient_id}/vitals", response_model=VitalSignsSchema)
async def create_vital_signs(
    patient_id: int,
    vitals_in: VitalSignsCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_doctor_user)
) -> VitalSignsSchema:
    """
    Record new vital signs for a patient.
    Only doctors can create vital signs records.
    """
    # Verify patient exists
    patient = await get_by_id(db, Patient, patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Create vital signs record
    db_vitals = await create(
        db,
        VitalSigns,
        patient_id=patient_id,
        measured_by=current_user.id,
        **vitals_in.dict()
    )
    
    return db_vitals


@router.get("/{patient_id}/vitals", response_model=List[VitalSignsSchema])
async def list_vital_signs(
    patient_id: int,
    start_date: datetime = None,
    end_date: datetime = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> List[VitalSignsSchema]:
    """
    List vital signs for a patient with optional date range filtering.
    Patient can view their own vitals.
    Medical staff can view their patients' vitals.
    """
    # Check access rights
    if current_user.role == "patient" and current_user.patient.id != patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access these vital signs"
        )
    
    # Build query
    stmt = select(VitalSigns).where(VitalSigns.patient_id == patient_id)
    
    # Apply date filters if provided
    if start_date:
        stmt = stmt.where(VitalSigns.measured_at >= start_date)
    if end_date:
        stmt = stmt.where(VitalSigns.measured_at <= end_date)
    
    # Order by measurement time
    stmt = stmt.order_by(VitalSigns.measured_at.desc())
    
    vitals = await get_all(db, VitalSigns, stmt=stmt)
    return vitals


@router.get("/{patient_id}/vitals/latest", response_model=VitalSignsSchema)
async def get_latest_vital_signs(
    patient_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> VitalSignsSchema:
    """
    Get the most recent vital signs for a patient.
    Patient can view their own vitals.
    Medical staff can view their patients' vitals.
    """
    # Check access rights
    if current_user.role == "patient" and current_user.patient.id != patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access these vital signs"
        )
    
    # Get latest vitals
    stmt = (
        select(VitalSigns)
        .where(VitalSigns.patient_id == patient_id)
        .order_by(VitalSigns.measured_at.desc())
    )
    result = await db.execute(stmt)
    latest_vitals = result.scalar_one_or_none()
    
    if not latest_vitals:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No vital signs found for this patient"
        )
    
    return latest_vitals


@router.get("/{patient_id}/vitals/{vitals_id}", response_model=VitalSignsSchema)
async def get_vital_signs(
    patient_id: int,
    vitals_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> VitalSignsSchema:
    """
    Get specific vital signs record.
    Patient can view their own vitals.
    Medical staff can view their patients' vitals.
    """
    # Check access rights
    if current_user.role == "patient" and current_user.patient.id != patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access these vital signs"
        )
    
    stmt = select(VitalSigns).where(
        and_(
            VitalSigns.id == vitals_id,
            VitalSigns.patient_id == patient_id
        )
    )
    result = await db.execute(stmt)
    vitals = result.scalar_one_or_none()
    
    if not vitals:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vital signs record not found"
        )
    
    return vitals


@router.put("/{patient_id}/vitals/{vitals_id}", response_model=VitalSignsSchema)
async def update_vital_signs(
    patient_id: int,
    vitals_id: int,
    vitals_in: VitalSignsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_doctor_user)
) -> VitalSignsSchema:
    """
    Update vital signs record.
    Only doctors can update vital signs.
    """
    # Verify record exists and belongs to patient
    stmt = select(VitalSigns).where(
        and_(
            VitalSigns.id == vitals_id,
            VitalSigns.patient_id == patient_id
        )
    )
    result = await db.execute(stmt)
    vitals = result.scalar_one_or_none()
    
    if not vitals:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vital signs record not found"
        )
    
    # Update fields
    update_data = vitals_in.dict(exclude_unset=True)
    updated_vitals = await update_by_id(db, VitalSigns, vitals_id, **update_data)
    
    return updated_vitals


@router.delete("/{patient_id}/vitals/{vitals_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vital_signs(
    patient_id: int,
    vitals_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_doctor_user)
) -> None:
    """
    Delete vital signs record.
    Only doctors can delete vital signs.
    """
    # Verify record exists and belongs to patient
    stmt = select(VitalSigns).where(
        and_(
            VitalSigns.id == vitals_id,
            VitalSigns.patient_id == patient_id
        )
    )
    result = await db.execute(stmt)
    vitals = result.scalar_one_or_none()
    
    if not vitals:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vital signs record not found"
        )
    
    await delete_by_id(db, VitalSigns, vitals_id) 