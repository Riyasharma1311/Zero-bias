from datetime import datetime, timezone
from typing import Optional, List, Dict, Union
from pydantic import BaseModel, Field, validator, EmailStr
from app.models.patient import Gender, BloodType
from enum import Enum


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


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class Ethnicity(str, Enum):
    CAUCASIAN = "caucasian"
    AFRICAN_AMERICAN = "african_american"
    HISPANIC = "hispanic"
    ASIAN = "asian"
    NATIVE_AMERICAN = "native_american"
    OTHER = "other"


class AdmissionType(str, Enum):
    EMERGENCY = "emergency"
    URGENT = "urgent"
    ELECTIVE = "elective"
    NEWBORN = "newborn"
    TRAUMA = "trauma"


class DischargeLocation(str, Enum):
    HOME = "home"
    SNF = "snf"
    REHAB = "rehab"
    LTAC = "ltac"
    OTHER = "other"


class DRGType(str, Enum):
    MEDICAL = "medical"
    SURGICAL = "surgical"
    OTHER = "other"


class BloodType(str, Enum):
    A_POSITIVE = "A+"
    A_NEGATIVE = "A-"
    B_POSITIVE = "B+"
    B_NEGATIVE = "B-"
    O_POSITIVE = "O+"
    O_NEGATIVE = "O-"
    AB_POSITIVE = "AB+"
    AB_NEGATIVE = "AB-"


class PatientReportBase(BaseModel):
    drg_code: str
    drg_description: Optional[str] = None
    drg_severity: int
    drg_mortality: int
    cpt_codes: List[str]
    icd9_codes: List[str]
    procedure_pairs: List[List[int]]
    lab_events: List[str]


class PatientReportCreate(PatientReportBase):
    pass


class PatientReport(PatientReportBase):
    id: int
    patient_id: int
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None

    class Config:
        from_attributes = True


class PatientBase(BaseModel):
    """Base schema for patient information."""
    full_name: str
    date_of_birth: datetime
    gender: Gender
    ethnicity: Optional[Ethnicity] = None
    contact_number: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    
    # Admission information
    admission_type: Optional[AdmissionType] = None
    discharge_location: Optional[DischargeLocation] = None
    drg_type: Optional[DRGType] = None
    
    # Medical information
    blood_type: Optional[BloodType] = None
    height: Optional[float] = Field(None, ge=0, le=300)  # cm
    weight: Optional[float] = Field(None, ge=0, le=1000)  # kg
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None
    current_medications: Optional[str] = None
    family_history: Optional[str] = None
    
    # Clinical indicators
    diabetes: bool = False
    hypertension: bool = False
    chronic_kidney_disease: bool = False
    copd: bool = False
    coronary_artery_disease: bool = False
    atrial_fibrillation: bool = False
    
    # Medications
    ace_inhibitors: bool = False
    arbs: bool = False
    beta_blockers: bool = False
    diuretics: bool = False
    mras: bool = False
    sglt2_inhibitors: bool = False
    
    # Contact information
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
    reports: Optional[List[PatientReportCreate]] = None


class PatientUpdate(BaseModel):
    """Schema for updating patient record."""
    full_name: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    gender: Optional[Gender] = None
    ethnicity: Optional[Ethnicity] = None
    contact_number: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    admission_type: Optional[AdmissionType] = None
    discharge_location: Optional[DischargeLocation] = None
    drg_type: Optional[DRGType] = None
    blood_type: Optional[BloodType] = None
    height: Optional[float] = Field(None, ge=0, le=300)
    weight: Optional[float] = Field(None, ge=0, le=1000)
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None
    current_medications: Optional[str] = None
    family_history: Optional[str] = None
    diabetes: Optional[bool] = None
    hypertension: Optional[bool] = None
    chronic_kidney_disease: Optional[bool] = None
    copd: Optional[bool] = None
    coronary_artery_disease: Optional[bool] = None
    atrial_fibrillation: Optional[bool] = None
    ace_inhibitors: Optional[bool] = None
    arbs: Optional[bool] = None
    beta_blockers: Optional[bool] = None
    diuretics: Optional[bool] = None
    mras: Optional[bool] = None
    sglt2_inhibitors: Optional[bool] = None
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
    reports: List[PatientReport]
    vital_signs: List[dict]
    medical_records: List[dict]
    risk_assessments: List[dict]

    class Config:
        from_attributes = True 