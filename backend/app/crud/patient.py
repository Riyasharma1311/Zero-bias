from typing import List
from datetime import datetime, timedelta
from sqlalchemy import select, and_, or_, exists, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.patient import Patient, RiskAssessment

async def get_patients_due_for_reassessment(db: AsyncSession) -> List[Patient]:
    """Get patients who need risk reassessment."""
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    # Subquery to get latest assessment date for each patient
    latest_assessment = (
        select(RiskAssessment.patient_id, 
               func.max(RiskAssessment.assessed_at).label('latest_assessment'))
        .group_by(RiskAssessment.patient_id)
        .subquery()
    )
    
    # Main query using the subquery
    query = (
        select(Patient)
        .outerjoin(latest_assessment, Patient.id == latest_assessment.c.patient_id)
        .where(or_(
            latest_assessment.c.latest_assessment == None,  # No assessments
            latest_assessment.c.latest_assessment < thirty_days_ago  # Outdated
        ))
    )
    
    result = await db.execute(query)
    return result.scalars().all() 