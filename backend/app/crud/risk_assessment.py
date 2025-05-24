from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
import json

from app.models.patient import RiskAssessment
from app.services.prediction_service import CURRENT_MODEL_VERSION

async def create_risk_assessment(
    db: AsyncSession,
    patient_id: int,
    heart_attack_risk: float,
    stroke_risk: float,
    cardiovascular_age: float,
    confidence_score: float,
    recommendations: List[str],
    factors: Dict[str, Any],
    assessed_at: datetime = None
) -> RiskAssessment:
    """Create a new risk assessment record."""
    db_assessment = RiskAssessment(
        patient_id=patient_id,
        heart_attack_risk=heart_attack_risk,
        stroke_risk=stroke_risk,
        cardiovascular_age=cardiovascular_age,
        factors_considered=json.dumps({
            "version": CURRENT_MODEL_VERSION,
            "factors": factors
        }),
        recommendations=json.dumps(recommendations),
        confidence_score=confidence_score,
        model_version=CURRENT_MODEL_VERSION,
        assessed_at=assessed_at or datetime.utcnow()
    )
    
    db.add(db_assessment)
    await db.commit()
    await db.refresh(db_assessment)
    
    return db_assessment 