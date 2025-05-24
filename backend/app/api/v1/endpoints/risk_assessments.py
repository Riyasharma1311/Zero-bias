from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
import json

from app.api.deps import get_db, get_doctor_user, get_current_active_user
from app.models.user import User
from app.models.patient import Patient, RiskAssessment
from app.schemas.patient import (
    RiskAssessment as RiskAssessmentSchema,
    RiskAssessmentCreate,
    RiskAssessmentUpdate
)
from app.services.prediction_service import PredictionService, CURRENT_MODEL_VERSION
from app.db.session import get_by_id, get_all, create, update_by_id, delete_by_id

router = APIRouter()


@router.post("/{patient_id}/risk-assessment", response_model=RiskAssessmentSchema)
async def create_risk_assessment(
    patient_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_doctor_user)
) -> RiskAssessmentSchema:
    """
    Generate a new risk assessment for a patient.
    Only doctors can create assessments.
    """
    # Get patient with related data
    patient = await get_by_id(db, Patient, patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Generate prediction
    risk_scores, confidence_score, recommendations = await PredictionService.predict_risk(patient)
    
    # Create assessment record
    db_assessment = await create(
        db,
        RiskAssessment,
        patient_id=patient_id,
        heart_attack_risk=risk_scores["heart_attack_risk"],
        stroke_risk=risk_scores["stroke_risk"],
        cardiovascular_age=risk_scores["cardiovascular_age"],
        factors_considered=json.dumps(risk_scores),
        recommendations=json.dumps(recommendations),
        confidence_score=confidence_score,
        model_version=CURRENT_MODEL_VERSION,
        assessed_by=current_user.id
    )
    
    return db_assessment


@router.get("/{patient_id}/risk-assessments", response_model=List[RiskAssessmentSchema])
async def list_risk_assessments(
    patient_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> List[RiskAssessmentSchema]:
    """
    List all risk assessments for a patient.
    Patient can view their own assessments.
    Medical staff can view their patients' assessments.
    """
    # Check access rights
    if current_user.role == "patient" and current_user.patient.id != patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access these assessments"
        )
    
    stmt = (
        select(RiskAssessment)
        .where(RiskAssessment.patient_id == patient_id)
        .order_by(RiskAssessment.assessed_at.desc())
    )
    
    assessments = await get_all(db, RiskAssessment, stmt=stmt)
    return assessments


@router.get("/{patient_id}/risk-assessments/{assessment_id}", response_model=RiskAssessmentSchema)
async def get_risk_assessment(
    patient_id: int,
    assessment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> RiskAssessmentSchema:
    """
    Get a specific risk assessment.
    Patient can view their own assessment.
    Medical staff can view their patients' assessments.
    """
    # Check access rights
    if current_user.role == "patient" and current_user.patient.id != patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this assessment"
        )
    
    stmt = select(RiskAssessment).where(
        and_(
            RiskAssessment.id == assessment_id,
            RiskAssessment.patient_id == patient_id
        )
    )
    result = await db.execute(stmt)
    assessment = result.scalar_one_or_none()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    return assessment


@router.put("/{patient_id}/risk-assessments/{assessment_id}", response_model=RiskAssessmentSchema)
async def update_risk_assessment(
    patient_id: int,
    assessment_id: int,
    assessment_in: RiskAssessmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_doctor_user)
) -> RiskAssessmentSchema:
    """
    Update a risk assessment's recommendations.
    Only doctors can update assessments.
    """
    # Verify assessment exists and belongs to patient
    stmt = select(RiskAssessment).where(
        and_(
            RiskAssessment.id == assessment_id,
            RiskAssessment.patient_id == patient_id
        )
    )
    result = await db.execute(stmt)
    assessment = result.scalar_one_or_none()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    # Update recommendations if provided
    update_data = {}
    if assessment_in.recommendations is not None:
        update_data["recommendations"] = json.dumps(assessment_in.recommendations)
    
    updated_assessment = await update_by_id(
        db, RiskAssessment, assessment_id, **update_data
    )
    
    return updated_assessment


@router.delete("/{patient_id}/risk-assessments/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_risk_assessment(
    patient_id: int,
    assessment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_doctor_user)
) -> None:
    """
    Delete a risk assessment.
    Only doctors can delete assessments.
    """
    # Verify assessment exists and belongs to patient
    stmt = select(RiskAssessment).where(
        and_(
            RiskAssessment.id == assessment_id,
            RiskAssessment.patient_id == patient_id
        )
    )
    result = await db.execute(stmt)
    assessment = result.scalar_one_or_none()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    await delete_by_id(db, RiskAssessment, assessment_id)