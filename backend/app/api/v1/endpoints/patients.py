from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import selectinload

from app.api.deps import get_db, get_doctor_user, get_admin_user, get_current_active_user
from app.models.user import User, UserRole
from app.models.patient import Patient, patient_doctors
from app.schemas.patient import (
    Patient as PatientSchema,
    PatientCreate,
    PatientUpdate,
    PatientDetail
)
from app.db.session import get_by_id, get_all, create, update_by_id, delete_by_id

router = APIRouter()

@router.post("", response_model=PatientSchema)
async def create_patient(
    patient_in: PatientCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_doctor_user)
) -> PatientSchema:
    """
    Create a new patient record.
    Only doctors can create patients.
    """
    # Create patient record with initial data
    db_patient = Patient(**patient_in.model_dump())
    
    # Add to session
    db.add(db_patient)
    await db.commit()
    await db.refresh(db_patient)
    
    # Add the creating doctor to the patient's doctors using the secondary table
    stmt = patient_doctors.insert().values(
        patient_id=db_patient.id,
        doctor_id=current_user.id
    )
    await db.execute(stmt)
    await db.commit()
    
    # Create response object with doctor IDs
    response_dict = db_patient.__dict__
    response_dict['doctors'] = [current_user.id]
    
    return response_dict

@router.get("", response_model=List[PatientSchema])
async def list_patients(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> List[PatientSchema]:
    """
    List all patients.
    Doctors see their assigned patients, admins see all patients.
    """
    # Base query to get patients with their doctor IDs
    stmt = (
        select(
            Patient,
            func.group_concat(patient_doctors.c.doctor_id).label('doctor_ids')
        )
        .outerjoin(patient_doctors)
        .group_by(Patient.id)
    )
    
    # If doctor, only show their patients
    if current_user.role == UserRole.DOCTOR:
        stmt = stmt.where(patient_doctors.c.doctor_id == current_user.id)
    
    # Execute query
    result = await db.execute(stmt)
    rows = result.all()
    
    # Process results
    patients = []
    for row in rows:
        patient_dict = row[0].__dict__
        doctor_ids_str = row[1]
        # Convert comma-separated string to list of integers, handle None case
        patient_dict['doctors'] = (
            [int(id_) for id_ in doctor_ids_str.split(',')]
            if doctor_ids_str else []
        )
        patients.append(patient_dict)
    
    return patients[skip:skip + limit]

@router.get("/{patient_id}", response_model=PatientDetail)
async def get_patient(
    patient_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> PatientDetail:
    """
    Get detailed patient information.
    Doctors can view their assigned patients, admins can view all patients.
    """
    # Get patient with all relationships loaded
    stmt = (
        select(Patient)
        .options(
            selectinload(Patient.doctors),
            selectinload(Patient.vital_signs),
            selectinload(Patient.medical_records),
            selectinload(Patient.risk_assessments)
        )
        .where(Patient.id == patient_id)
    )
    result = await db.execute(stmt)
    patient = result.scalar_one_or_none()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Check access rights for doctors
    if current_user.role == UserRole.DOCTOR:
        doctor_ids = [d.id for d in patient.doctors]
        if current_user.id not in doctor_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this patient record"
            )
    
    # Convert to dict and format the response
    response_dict = {
        **patient.__dict__,
        'doctors': [d.id for d in patient.doctors],
        'vital_signs': patient.vital_signs,
        'medical_records': patient.medical_records,
        'risk_assessments': patient.risk_assessments
    }
    
    # Remove SQLAlchemy state
    response_dict.pop('_sa_instance_state', None)
    
    return response_dict

@router.put("/{patient_id}", response_model=PatientSchema)
async def update_patient(
    patient_id: int,
    patient_in: PatientUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> PatientSchema:
    """
    Update patient information.
    Doctors can update their assigned patients, admins can update any patient.
    """
    # Get patient with doctors loaded
    stmt = (
        select(Patient)
        .options(selectinload(Patient.doctors))
        .where(Patient.id == patient_id)
    )
    result = await db.execute(stmt)
    patient = result.scalar_one_or_none()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Check access rights for doctors
    if current_user.role == UserRole.DOCTOR:
        doctor_ids = [d.id for d in patient.doctors]
        if current_user.id not in doctor_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this patient record"
            )
    
    # Update fields
    update_data = patient_in.dict(exclude_unset=True)
    updated_patient = await update_by_id(db, Patient, patient_id, **update_data)
    
    # Format response
    response_dict = {
        **updated_patient.__dict__,
        'doctors': doctor_ids
    }
    response_dict.pop('_sa_instance_state', None)
    
    return response_dict

@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient(
    patient_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_admin_user)
) -> None:
    """
    Delete patient record.
    Only admins can delete patient records.
    """
    deleted = await delete_by_id(db, Patient, patient_id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

@router.post("/{patient_id}/assign-doctor/{doctor_id}", response_model=PatientSchema)
async def assign_doctor(
    patient_id: int,
    doctor_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_admin_user)
) -> PatientSchema:
    """
    Assign a doctor to a patient.
    Only admins can assign doctors.
    """
    # Get patient
    patient = await get_by_id(db, Patient, patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Get doctor
    stmt = select(User).where(
        and_(User.id == doctor_id, User.role == UserRole.DOCTOR)
    )
    result = await db.execute(stmt)
    doctor = result.scalar_one_or_none()
    
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    # Add doctor to patient's doctors
    if doctor not in patient.doctors:
        patient.doctors.append(doctor)
        await db.commit()
        await db.refresh(patient)
    
    return patient

@router.delete("/{patient_id}/remove-doctor/{doctor_id}", response_model=PatientSchema)
async def remove_doctor(
    patient_id: int,
    doctor_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_admin_user)
) -> PatientSchema:
    """
    Remove a doctor from a patient.
    Only admins can remove doctors.
    """
    # Get patient
    patient = await get_by_id(db, Patient, patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Get doctor
    stmt = select(User).where(
        and_(User.id == doctor_id, User.role == UserRole.DOCTOR)
    )
    result = await db.execute(stmt)
    doctor = result.scalar_one_or_none()
    
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    # Remove doctor from patient's doctors
    if doctor in patient.doctors:
        patient.doctors.remove(doctor)
        await db.commit()
        await db.refresh(patient)
    
    return patient 