from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class Gender(str, enum.Enum):
    """Patient gender enumeration."""
    MALE = "male"
    FEMALE = "female"
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
    contact_number = Column(String)
    email = Column(String)
    address = Column(String)
    
    # Medical information
    blood_type = Column(Enum(BloodType))
    height = Column(Float)  # in centimeters
    weight = Column(Float)  # in kilograms
    allergies = Column(String)
    chronic_conditions = Column(String)
    current_medications = Column(String)
    family_history = Column(String)
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