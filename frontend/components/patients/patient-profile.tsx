"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, Calendar, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Patient, ClinicalData, Comorbidity, Medication, Admission } from "@/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

interface PatientProfileProps {
  patient: Patient | null
  clinicalData: ClinicalData | null
  comorbidities: Comorbidity | null
  medications: Medication | null
  admissions: Admission[]
}

export function PatientProfile({ patient, clinicalData, comorbidities, medications, admissions }: PatientProfileProps) {
  const [activeTab, setActiveTab] = useState("admissions")

  if (!patient || !clinicalData) {
    return <div>Patient data not found</div>
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date))
  }

  const getRiskLabel = (score: number) => {
    if (score < 30) return "Low Risk"
    if (score < 70) return "Medium Risk"
    return "High Risk"
  }

  const getRiskColor = (score: number) => {
    if (score < 30) return "#4ade80"
    if (score < 70) return "#facc15"
    return "#f87171"
  }

  // Prepare risk factors data for chart
  const riskFactorsData = []

  if (clinicalData.bnp > 400) {
    riskFactorsData.push({ name: "High BNP", value: 75, fill: "#f87171" })
  }

  if (patient.age > 65) {
    riskFactorsData.push({ name: "Age > 65", value: 60, fill: "#f87171" })
  }

  if (comorbidities?.diabetes) {
    riskFactorsData.push({ name: "Diabetes", value: 45, fill: "#f87171" })
  }

  if (comorbidities?.hypertension) {
    riskFactorsData.push({ name: "Hypertension", value: 40, fill: "#f87171" })
  }

  if (comorbidities?.priorHeartFailure) {
    riskFactorsData.push({ name: "Prior HF", value: 30, fill: "#f87171" })
  }

  return (
    <div className="max-w-6xl w-full mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="text-pink-600 hover:text-pink-700 flex items-center">
          <span className="mr-2">←</span> Heart Sync
        </Link>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-pink-600">
            <Heart className="h-12 w-12" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Patient : {patient.patientId}</h1>
            <p className="text-muted-foreground">
              • {patient.age} years old, {patient.gender} • Patient ID: {patient.patientId}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Follow Up
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#f9d2e4" strokeWidth="10" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={getRiskColor(clinicalData.riskScore)}
                    strokeWidth="10"
                    strokeDasharray={`${clinicalData.riskScore * 2.83} 283`}
                    strokeDashoffset="0"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold">{clinicalData.riskScore}%</span>
                  <span className="text-lg font-medium text-pink-600">{getRiskLabel(clinicalData.riskScore)}</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground text-center">(model confidence : 83%)</div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Patient Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-2">• Last Admission:</span>
                  <span className="font-medium">{formatDate(clinicalData.lastAdmissionDate)}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-2">• Primary Diagnosis:</span>
                  <span className="font-medium">{clinicalData.primaryDiagnosis}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-2">• Ejection Fraction:</span>
                  <span className="font-medium">{clinicalData.ejectionFraction}%</span>
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-2">• Last BNP:</span>
                  <span className="font-medium">{clinicalData.bnp} pg/mL</span>
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-2">• Weight:</span>
                  <span className="font-medium">{patient.weight} kg</span>
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-2">• Blood Pressure:</span>
                  <span className="font-medium">
                    {clinicalData.bloodPressureSystolic}/{clinicalData.bloodPressureDiastolic} mmHg
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Risk Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={riskFactorsData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip
                    formatter={(value) => [`${value}`, "Risk Weight"]}
                    contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                Suggested Medication →
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clinical History</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="admissions" className="flex-1">
                  Hospital Admissions
                </TabsTrigger>
                <TabsTrigger value="labs" className="flex-1">
                  Lab Results
                </TabsTrigger>
              </TabsList>
              <TabsContent value="admissions" className="mt-4">
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Reason</th>
                        <th className="text-left p-2">Length (days)</th>
                        <th className="text-left p-2">Facility</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admissions.map((admission, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{formatDate(admission.date)}</td>
                          <td className="p-2">{admission.reason}</td>
                          <td className="p-2">{admission.lengthOfStay}</td>
                          <td className="p-2">{admission.facility}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              <TabsContent value="labs" className="mt-4">
                <div className="text-center py-8 text-muted-foreground">Lab results will be displayed here</div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
