from datetime import datetime, timedelta
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import BackgroundTasks

from app.core.config import get_settings
from app.db.session import get_db
from app.models.patient import Patient
from app.services.prediction_service import PredictionService
from app.crud.patient import get_patients_due_for_reassessment
from app.crud.risk_assessment import create_risk_assessment

settings = get_settings()
logger = logging.getLogger(__name__)

# Configure reassessment settings
REASSESSMENT_INTERVAL_DAYS = 30  # Reassess monthly by default
HIGH_RISK_REASSESSMENT_DAYS = 7  # Reassess weekly for high-risk patients


async def should_reassess_patient(patient: Patient) -> bool:
    """
    Determine if a patient is due for risk reassessment.
    
    Args:
        patient: Patient model instance
        
    Returns:
        bool: True if patient should be reassessed
    """
    if not patient.risk_assessments:
        return True
        
    latest_assessment = max(
        patient.risk_assessments,
        key=lambda x: x.assessed_at
    )
    
    # Determine reassessment interval based on risk level
    interval_days = (
        HIGH_RISK_REASSESSMENT_DAYS
        if latest_assessment.heart_attack_risk >= 0.7
        or latest_assessment.stroke_risk >= 0.7
        else REASSESSMENT_INTERVAL_DAYS
    )
    
    next_assessment_due = latest_assessment.assessed_at + timedelta(days=interval_days)
    return datetime.utcnow() >= next_assessment_due


async def perform_risk_reassessment(
    db: AsyncSession,
    patient: Patient
) -> None:
    """
    Perform risk reassessment for a single patient.
    
    Args:
        db: Database session
        patient: Patient to reassess
    """
    try:
        # Get latest vital signs
        if not patient.vital_signs:
            logger.warning(f"No vital signs found for patient {patient.id}")
            return
            
        latest_vitals = max(
            patient.vital_signs,
            key=lambda x: x.measured_at
        )
        
        # Perform prediction
        prediction_service = PredictionService()
        risk_scores, confidence, recommendations = await prediction_service.predict_risk(
            patient=patient,
            vital_signs=latest_vitals
        )
        
        # Create new assessment
        await create_risk_assessment(
            db=db,
            patient_id=patient.id,
            heart_attack_risk=risk_scores['heart_attack_risk'],
            stroke_risk=risk_scores['stroke_risk'],
            cardiovascular_age=risk_scores['cardiovascular_age'],
            confidence_score=confidence,
            recommendations=recommendations,
            assessed_at=datetime.utcnow()
        )
        
        logger.info(f"Successfully reassessed patient {patient.id}")
        
    except Exception as e:
        logger.error(f"Error reassessing patient {patient.id}: {str(e)}")


async def run_periodic_reassessment(background_tasks: BackgroundTasks) -> None:
    """
    Background task to perform periodic risk reassessment for all eligible patients.
    """
    try:
        async for db in get_db():
            # Get patients due for reassessment
            patients = await get_patients_due_for_reassessment(db)
            
            for patient in patients:
                if await should_reassess_patient(patient):
                    # Add reassessment task to background tasks
                    background_tasks.add_task(
                        perform_risk_reassessment,
                        db=db,
                        patient=patient
                    )
            
            logger.info(f"Scheduled reassessment for {len(patients)} patients")
            
    except Exception as e:
        logger.error(f"Error in periodic reassessment: {str(e)}") 