from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Form
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
import json
from datetime import datetime

from app.api.deps import get_db, get_doctor_user, get_current_active_user
from app.models.user import User
from app.models.patient import MedicalRecord
from app.schemas.patient import (
    MedicalRecord as MedicalRecordSchema,
    MedicalRecordCreate,
    MedicalRecordUpdate
)
from app.services.file_service import FileService
from app.db.session import get_by_id, get_all, create, update_by_id, delete_by_id

router = APIRouter()


@router.post("/{patient_id}/records", response_model=MedicalRecordSchema)
async def create_medical_record(
    patient_id: int,
    title: str = Form(...),
    description: str = Form(None),
    record_type: str = Form(...),
    recorded_at: datetime = Form(default_factory=datetime.utcnow),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_doctor_user)
) -> MedicalRecordSchema:
    """
    Create a new medical record with file upload.
    Only doctors can create records.
    """
    # Create record data
    record_in = MedicalRecordCreate(
        title=title,
        description=description,
        record_type=record_type,
        recorded_at=recorded_at
    )
    
    # Save the file
    file_path, mime_type = await FileService.save_file(
        file=file,
        patient_id=patient_id,
        record_type=record_in.record_type
    )
    
    # Create database record
    db_record = await create(
        db,
        MedicalRecord,
        patient_id=patient_id,
        title=record_in.title,
        description=record_in.description,
        record_type=record_in.record_type,
        recorded_at=record_in.recorded_at,
        file_path=file_path,
        mime_type=mime_type,
        created_by=current_user.id
    )
    
    return db_record


@router.get("/{patient_id}/records", response_model=List[MedicalRecordSchema])
async def list_medical_records(
    patient_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> List[MedicalRecordSchema]:
    """
    List all medical records for a patient.
    Patient can view their own records.
    Medical staff can view their patients' records.
    """
    # Check access rights
    if current_user.role == "patient" and current_user.patient.id != patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access these records"
        )
    
    stmt = select(MedicalRecord).where(MedicalRecord.patient_id == patient_id)
    records = await get_all(db, MedicalRecord, stmt=stmt)
    
    return records


@router.get("/{patient_id}/records/{record_id}/download")
async def download_medical_record(
    patient_id: int,
    record_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> StreamingResponse:
    """
    Download a medical record file.
    Patient can download their own records.
    Medical staff can download their patients' records.
    """
    # Check access rights
    if current_user.role == "patient" and current_user.patient.id != patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this record"
        )
    
    # Get record from database
    stmt = select(MedicalRecord).where(
        and_(
            MedicalRecord.id == record_id,
            MedicalRecord.patient_id == patient_id
        )
    )
    result = await db.execute(stmt)
    record = result.scalar_one_or_none()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record not found"
        )
    
    # Get file stream
    file_stream = await FileService.stream_file(record.file_path)
    if not file_stream:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    return StreamingResponse(
        file_stream,
        media_type=record.mime_type,
        headers={
            "Content-Disposition": f'attachment; filename="{record.title}"'
        }
    )


@router.put("/{patient_id}/records/{record_id}", response_model=MedicalRecordSchema)
async def update_medical_record(
    patient_id: int,
    record_id: int,
    record_in: MedicalRecordUpdate,
    file: UploadFile = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_doctor_user)
) -> MedicalRecordSchema:
    """
    Update a medical record.
    Only doctors can update records.
    """
    # Get existing record
    stmt = select(MedicalRecord).where(
        and_(
            MedicalRecord.id == record_id,
            MedicalRecord.patient_id == patient_id
        )
    )
    result = await db.execute(stmt)
    record = result.scalar_one_or_none()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record not found"
        )
    
    # Update file if provided
    update_data = record_in.dict(exclude_unset=True)
    if file:
        # Delete old file
        if record.file_path:
            await FileService.delete_file(record.file_path)
        
        # Save new file
        file_path, mime_type = await FileService.save_file(
            file=file,
            patient_id=patient_id,
            record_type=record.record_type
        )
        update_data["file_path"] = file_path
        update_data["mime_type"] = mime_type
    
    # Update record fields
    updated_record = await update_by_id(
        db, MedicalRecord, record_id, **update_data
    )
    
    return updated_record


@router.delete("/{patient_id}/records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medical_record(
    patient_id: int,
    record_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_doctor_user)
) -> None:
    """
    Delete a medical record.
    Only doctors can delete records.
    """
    # Get record
    stmt = select(MedicalRecord).where(
        and_(
            MedicalRecord.id == record_id,
            MedicalRecord.patient_id == patient_id
        )
    )
    result = await db.execute(stmt)
    record = result.scalar_one_or_none()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record not found"
        )
    
    # Delete file
    if record.file_path:
        await FileService.delete_file(record.file_path)
    
    # Delete database record
    await delete_by_id(db, MedicalRecord, record_id) 