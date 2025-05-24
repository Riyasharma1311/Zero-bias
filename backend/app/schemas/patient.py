from datetime import datetime, timezone
from typing import Optional, List, Dict, Union
from pydantic import BaseModel, Field, validator
from app.models.patient import Gender, BloodType


class VitalSignsBase(BaseModel):
    """Base schema for vital signs measurements."""
    heart_rate: Optional[float] = Field(None, ge=0, le=300)
    blood_pressure_systolic: Optional[float] = Field(None, ge=0, le=300)
    blood_pressure_diastolic: Optional[float] = Field(None, ge=0, le=300)
    temperature: Optional[float] = Field(None, ge=30, le=45)
    respiratory_rate: Optional[float] = Field(None, ge=0, le=100)
    oxygen_saturation: Optional[float] = Field(None, ge=0, le=100)
    notes: Optional[str] = None


class VitalSignsCreate(VitalSignsBase):
    """Schema for creating vital signs record."""
    measured_at: datetime = Field(default_factory=datetime.utcnow)


class VitalSignsUpdate(VitalSignsBase):
    """Schema for updating vital signs record."""
    pass


class VitalSigns(VitalSignsBase):
    """Schema for vital signs response."""
    id: int
    patient_id: int
    measured_at: datetime
    measured_by: int
    created_at: datetime

    class Config:
        from_attributes = True


class MedicalRecordBase(BaseModel):
    """Base schema for medical records."""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    record_type: str
    recorded_at: datetime = Field(default_factory=datetime.utcnow)


class MedicalRecordCreate(MedicalRecordBase):
    """Schema for creating medical record."""
    pass


class MedicalRecordUpdate(BaseModel):
    """Schema for updating medical record."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    record_type: Optional[str] = None
    recorded_at: Optional[datetime] = None


class MedicalRecord(MedicalRecordBase):
    """Schema for medical record response."""
    id: int
    patient_id: int
    file_path: Optional[str]
    mime_type: Optional[str]
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RiskAssessmentBase(BaseModel):
    """Base schema for risk assessments."""
    heart_attack_risk: float = Field(..., ge=0, le=100)
    stroke_risk: float = Field(..., ge=0, le=100)
    cardiovascular_age: float = Field(..., ge=0)
    factors_considered: Dict[str, Union[str, float, bool]]
    recommendations: Optional[List[str]] = None
    confidence_score: float = Field(..., ge=0, le=1)
    model_version: str


class RiskAssessmentCreate(RiskAssessmentBase):
    """Schema for creating risk assessment."""
    assessed_at: datetime = Field(default_factory=datetime.utcnow)


class RiskAssessmentUpdate(BaseModel):
    """Schema for updating risk assessment."""
    recommendations: Optional[List[str]] = None


class RiskAssessment(RiskAssessmentBase):
    """Schema for risk assessment response."""
    id: int
    patient_id: int
    assessed_at: datetime
    assessed_by: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class PatientBase(BaseModel):
    """Base schema for patient information."""
    full_name: str
    date_of_birth: datetime
    gender: Gender
    contact_number: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    blood_type: Optional[BloodType] = None
    height: Optional[float] = Field(None, ge=0, le=300)  # cm
    weight: Optional[float] = Field(None, ge=0, le=1000)  # kg
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None
    current_medications: Optional[str] = None
    family_history: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_number: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_id: Optional[str] = None

    @validator('date_of_birth')
    def validate_birth_date(cls, v):
        if v.replace(tzinfo=timezone.utc) > datetime.now(timezone.utc):
            raise ValueError("Date of birth cannot be in the future")
        return v


class PatientCreate(PatientBase):
    """Schema for creating patient record."""
    pass


class PatientUpdate(BaseModel):
    """Schema for updating patient record."""
    full_name: Optional[str] = None
    contact_number: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    blood_type: Optional[BloodType] = None
    height: Optional[float] = Field(None, ge=0, le=300)
    weight: Optional[float] = Field(None, ge=0, le=1000)
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None
    current_medications: Optional[str] = None
    family_history: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_number: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_id: Optional[str] = None


class Patient(PatientBase):
    """Schema for patient response."""
    id: int
    created_at: datetime
    updated_at: datetime
    doctors: List[int] = []  # List of doctor IDs

    class Config:
        from_attributes = True


class PatientDetail(Patient):
    """Schema for detailed patient response including related records."""
    vital_signs: List[VitalSigns] = []
    medical_records: List[MedicalRecord] = []
    risk_assessments: List[RiskAssessment] = [] 