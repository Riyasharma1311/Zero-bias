export type User = {
  id: string
  name: string
  email: string
  role: "doctor" | "admin"
  image?: string
}

export type Patient = {
  id: string
  patientId: string
  name: string
  age: number
  gender: "Male" | "Female" | "Other"
  weight: number
  height: number
  createdAt: Date
  updatedAt: Date
}

export type ClinicalData = {
  id: string
  patientId: string
  creatinine: number
  bnp: number
  ejectionFraction: number
  sodium: number
  bloodPressureSystolic: number
  bloodPressureDiastolic: number
  lastAdmissionDate: Date
  primaryDiagnosis: string
  riskScore: number
  recordedAt: Date
}

export type Comorbidity = {
  id: string
  patientId: string
  diabetes: boolean
  hypertension: boolean
  chronicKidneyDisease: boolean
  copd: boolean
  coronaryArteryDisease: boolean
  atrialFibrillation: boolean
  priorHeartFailure: boolean
}

export type Medication = {
  id: string
  patientId: string
  aceInhibitors: boolean
  arbs: boolean
  betaBlockers: boolean
  diuretics: boolean
  mras: boolean
  sglt2Inhibitors: boolean
}

export type Admission = {
  id: string
  patientId: string
  date: Date
  reason: string
  lengthOfStay: number
  facility: string
}

export type DashboardStats = {
  totalPatients: number
  highRiskPatients: number
  avgReadmissionRisk: number
  currentlyMonitoring: number
  totalPatientsChange: number
  highRiskPatientsChange: number
  avgReadmissionRiskChange: number
  currentlyMonitoringChange: number
}

export type RiskDistribution = {
  low: number
  medium: number
  high: number
}

export type ReadmissionTrend = {
  month: string
  count: number
}
