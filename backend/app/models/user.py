from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class UserRole(str, enum.Enum):
    """User role enumeration."""
    ADMIN = "admin"
    DOCTOR = "doctor"


class User(Base):
    """User model with role-based access control."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    specialization = Column(String)  # Doctor's specialization
    license_number = Column(String)  # Medical license number
    role = Column(
        Enum(UserRole),
        nullable=False,
        default=UserRole.DOCTOR
    )
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationships
    patients = relationship(
        "Patient",
        secondary="patient_doctors",
        primaryjoin="and_(User.id == patient_doctors.c.doctor_id, "
                   "User.role == 'doctor')",
        secondaryjoin="Patient.id == patient_doctors.c.patient_id",
        back_populates="doctors"
    )

