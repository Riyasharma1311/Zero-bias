// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  specialization?: string;
  license_number?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export type UserRole = 'admin' | 'doctor';

export interface UserCreate {
  email: string;
  password: string;
  full_name: string;
  role?: UserRole;
  specialization?: string;
  license_number?: string;
}

export interface UserUpdate {
  email?: string;
  full_name?: string;
  password?: string;
  specialization?: string;
  license_number?: string;
  is_active?: boolean;
}

// Patient Types
export type Gender = 'male' | 'female' | 'other';
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';

export interface Patient {
  id: number;
  full_name: string;
  date_of_birth: string;
  gender: Gender;
  contact_number?: string;
  email?: string;
  address?: string;
  blood_type?: BloodType;
  height?: number;
  weight?: number;
  allergies?: string;
  chronic_conditions?: string;
  current_medications?: string;
  family_history?: string;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  insurance_provider?: string;
  insurance_id?: string;
  created_at: string;
  updated_at: string;
  doctors: number[];
}

export interface PatientCreate {
  full_name: string;
  date_of_birth: string;
  gender: Gender;
  contact_number?: string;
  email?: string;
  address?: string;
  blood_type?: BloodType;
  height?: number;
  weight?: number;
  allergies?: string;
  chronic_conditions?: string;
  current_medications?: string;
  family_history?: string;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  insurance_provider?: string;
  insurance_id?: string;
  DOB: string;
}

export interface PatientUpdate {
  full_name?: string;
  contact_number?: string;
  email?: string;
  address?: string;
  blood_type?: BloodType;
  height?: number;
  weight?: number;
  allergies?: string;
  chronic_conditions?: string;
  current_medications?: string;
  family_history?: string;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  insurance_provider?: string;
  insurance_id?: string;
}

// Vital Signs Types
export interface VitalSigns {
  id: number;
  patient_id: number;
  heart_rate?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  temperature?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  notes?: string;
  measured_at: string;
  measured_by: number;
  created_at: string;
}

export interface VitalSignsCreate {
  heart_rate?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  temperature?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  notes?: string;
  measured_at: string;
}

export interface VitalSignsUpdate {
  heart_rate?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  temperature?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  notes?: string;
}

// Risk Assessment Types
export interface RiskAssessment {
  id: number;
  patient_id: number;
  heart_attack_risk: number;
  stroke_risk: number;
  cardiovascular_age: number;
  factors_considered: Record<string, string | number | boolean>;
  recommendations?: string[];
  confidence_score: number;
  model_version: string;
  assessed_at: string;
  assessed_by: number | null;
  created_at: string;
}

export interface RiskAssessmentUpdate {
  recommendations?: string[];
}

// Medical Record Types
export interface MedicalRecord {
  id: number;
  patient_id: number;
  title: string;
  description?: string;
  record_type: string;
  recorded_at: string;
  file_path: string | null;
  mime_type: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecordCreate {
  title: string;
  description?: string;
  record_type: string;
  recorded_at: string;
  file: File;
}

export interface MedicalRecordUpdate {
  title?: string;
  description?: string;
  record_type?: string;
  recorded_at?: string;
  file?: File;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
} 