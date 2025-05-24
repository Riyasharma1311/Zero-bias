from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Table, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class Gender(str, enum.Enum):
    """Patient gender enumeration."""
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class Ethnicity(str, enum.Enum):
    """Patient ethnicity enumeration."""
    CAUCASIAN = "caucasian"
    AFRICAN_AMERICAN = "african_american"
    HISPANIC = "hispanic"
    ASIAN = "asian"
    NATIVE_AMERICAN = "native_american"
    OTHER = "other"


class AdmissionType(str, enum.Enum):
    """Admission type enumeration."""
    EMERGENCY = "emergency"
    URGENT = "urgent"
    ELECTIVE = "elective"
    NEWBORN = "newborn"
    TRAUMA = "trauma"


class DischargeLocation(str, enum.Enum):
    """Discharge location enumeration."""
    HOME = "home"
    SNF = "snf"  # Skilled Nursing Facility
    REHAB = "rehab"  # Rehabilitation Center
    LTAC = "ltac"  # Long Term Acute Care
    OTHER = "other"


class DRGType(str, enum.Enum):
    """DRG type enumeration."""
    MEDICAL = "medical"
    SURGICAL = "surgical"
    OTHER = "other"


class BloodType(str, enum.Enum):
    """Blood type enumeration."""
    A_POSITIVE = "A+"
    A_NEGATIVE = "A-"
    B_POSITIVE = "B+"
    B_NEGATIVE = "B-"
    O_POSITIVE = "O+"
    O_NEGATIVE = "O-"
    AB_POSITIVE = "AB+"
    AB_NEGATIVE = "AB-"


# Many-to-many relationship table for patients and doctors
patient_doctors = Table(
    'patient_doctors',
    Base.metadata,
    Column('patient_id', Integer, ForeignKey('patients.id'), primary_key=True),
    Column('doctor_id', Integer, ForeignKey('users.id'), primary_key=True)
)


class Patient(Base):
    """Patient model with medical information."""
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    
    # Basic information
    full_name = Column(String, nullable=False)
    date_of_birth = Column(DateTime(timezone=True), nullable=False)
    gender = Column(Enum(Gender), nullable=False)
    ethnicity = Column(Enum(Ethnicity))
    contact_number = Column(String)
    email = Column(String)
    address = Column(String)
    
    # Admission information
    admission_type = Column(Enum(AdmissionType))
    discharge_location = Column(Enum(DischargeLocation))
    drg_type = Column(Enum(DRGType))
    
    # Medical information
    blood_type = Column(Enum(BloodType))
    height = Column(Float)  # in centimeters
    weight = Column(Float)  # in kilograms
    allergies = Column(String)
    chronic_conditions = Column(String)
    current_medications = Column(String)
    family_history = Column(String)
    
    # Clinical indicators
    diabetes = Column(Boolean, default=False)
    hypertension = Column(Boolean, default=False)
    chronic_kidney_disease = Column(Boolean, default=False)
    copd = Column(Boolean, default=False)
    coronary_artery_disease = Column(Boolean, default=False)
    atrial_fibrillation = Column(Boolean, default=False)
    
    # Medications
    ace_inhibitors = Column(Boolean, default=False)
    arbs = Column(Boolean, default=False)
    beta_blockers = Column(Boolean, default=False)
    diuretics = Column(Boolean, default=False)
    mras = Column(Boolean, default=False)
    sglt2_inhibitors = Column(Boolean, default=False)
    
    # Contact information
    emergency_contact_name = Column(String)
    emergency_contact_number = Column(String)
    insurance_provider = Column(String)
    insurance_id = Column(String)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
    
    # Relationships
    doctors = relationship(
        "User",
        secondary=patient_doctors,
        primaryjoin="Patient.id == patient_doctors.c.patient_id",
        secondaryjoin="and_(User.id == patient_doctors.c.doctor_id, "
                     "User.role == 'doctor')"
    )
    vital_signs = relationship("VitalSigns", back_populates="patient")
    medical_records = relationship("MedicalRecord", back_populates="patient")
    risk_assessments = relationship("RiskAssessment", back_populates="patient")
    reports = relationship("PatientReport", back_populates="patient")


class PatientReport(Base):
    """Patient medical reports including DRG, procedures, and lab events."""
    __tablename__ = "patient_reports"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    
    # DRG Information
    drg_code = Column(String, nullable=False)
    drg_description = Column(String)
    drg_severity = Column(Integer)  # 0-4
    drg_mortality = Column(Integer)  # 0-4
    
    # Medical Codes
    cpt_codes = Column(JSON)  # List of CPT codes
    icd9_codes = Column(JSON)  # List of ICD9 codes
    procedure_pairs = Column(JSON)  # List of procedure pairs
    lab_events = Column(JSON)  # List of lab events with values and status
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    patient = relationship("Patient", back_populates="reports")
    author = relationship("User")


class VitalSigns(Base):
    """Patient vital signs measurements."""
    __tablename__ = "vital_signs"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    measured_at = Column(DateTime(timezone=True), nullable=False, index=True)
    
    # Vital measurements
    heart_rate = Column(Float)  # beats per minute
    blood_pressure_systolic = Column(Float)  # mmHg
    blood_pressure_diastolic = Column(Float)  # mmHg
    temperature = Column(Float)  # Celsius
    respiratory_rate = Column(Float)  # breaths per minute
    oxygen_saturation = Column(Float)  # percentage
    
    # Metadata
    measured_by = Column(Integer, ForeignKey("users.id"))
    notes = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="vital_signs")
    staff = relationship("User")


class MedicalRecord(Base):
    """Patient medical records and documents."""
    __tablename__ = "medical_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    record_type = Column(String, nullable=False, index=True)
    
    # Record details
    title = Column(String, nullable=False)
    description = Column(String)
    file_path = Column(String)  # Path to stored file
    mime_type = Column(String)
    
    # Metadata
    recorded_at = Column(DateTime(timezone=True), nullable=False, index=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
    
    # Relationships
    patient = relationship("Patient", back_populates="medical_records")
    author = relationship("User")


class RiskAssessment(Base):
    """Patient heart health risk assessments."""
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    
    # Risk scores
    heart_attack_risk = Column(Float)  # percentage
    stroke_risk = Column(Float)  # percentage
    cardiovascular_age = Column(Float)  # years
    
    # Assessment details
    factors_considered = Column(String, nullable=False)  # JSON string of factors
    recommendations = Column(String)  # JSON string of recommendations
    confidence_score = Column(Float, nullable=False)  # model confidence
    
    # Metadata
    assessed_at = Column(DateTime(timezone=True), nullable=False, index=True)
    assessed_by = Column(Integer, ForeignKey("users.id"))
    model_version = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="risk_assessments")
    assessor = relationship("User") 