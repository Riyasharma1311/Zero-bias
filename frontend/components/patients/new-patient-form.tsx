"use client"

import type { FormEvent, ChangeEvent } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { PatientReportForm } from "./PatientReportForm"

interface Report {
  drgCode: string
  drgDescription: string
  drgSeverity: string
  drgMortality: string
  cptCodes: string
  icd9Codes: string
  procedurePairs: string
  labEvents: string
}

interface FormData {
  age: string
  gender: string
  ethnicity: string
  admissionType: string
  dischargeLocation: string
  drgType: string
  weight: string
  height: string
  creatinine: string
  bnp: string
  ejectionFraction: string
  sodium: string
  diabetes: boolean
  hypertension: boolean
  chronicKidneyDisease: boolean
  copd: boolean
  coronaryArteryDisease: boolean
  atrialFibrillation: boolean
  aceInhibitors: boolean
  arbs: boolean
  betaBlockers: boolean
  diuretics: boolean
  mras: boolean
  sglt2Inhibitors: boolean
}

export function NewPatientForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReportForm, setShowReportForm] = useState(false)
  const [reports, setReports] = useState<Report[]>([])

  // Form state
  const [formData, setFormData] = useState<FormData>({
    // Demographics
    age: "",
    gender: "",
    ethnicity: "",
    admissionType: "",
    dischargeLocation: "",
    drgType: "",
    weight: "",
    height: "",

    // Clinical Information
    creatinine: "",
    bnp: "",
    ejectionFraction: "",
    sodium: "",

    // Comorbidities
    diabetes: false,
    hypertension: false,
    chronicKidneyDisease: false,
    copd: false,
    coronaryArteryDisease: false,
    atrialFibrillation: false,

    // Medications
    aceInhibitors: false,
    arbs: false,
    betaBlockers: false,
    diuretics: false,
    mras: false,
    sglt2Inhibitors: false,
  })

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev: FormData) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: FormData) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev: FormData) => ({ ...prev, [name]: checked }))
  }

  const handleAddReport = (report: Report) => {
    setReports((prev: Report[]) => [...prev, report])
    setShowReportForm(false)
  }

  const handleDeleteReport = (index: number) => {
    setReports((prev: Report[]) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const submitData = {
        ...formData,
        reports
      }
      
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push("/dashboard")
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePredictRisk = () => {
    // In a real app, this would call an API to predict risk
    alert("Risk prediction would be calculated here based on the entered data")
  }

  return (
    <div className="max-w-4xl w-full mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard" className="text-pink-600 hover:text-pink-700 flex items-center">
          <span className="mr-2">←</span> Heart Sync
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="text-pink-600">
          <Heart className="h-12 w-12" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">New Patient</h1>
          <p className="text-muted-foreground">Enter patient information to predict heart failure readmission risk</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-pink-50 rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold border-b pb-2">Demographics</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                placeholder="Enter age in years"
                value={formData.age}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ethnicity">Ethnicity</Label>
              <Select value={formData.ethnicity} onValueChange={(value) => handleSelectChange("ethnicity", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Ethnicity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="caucasian">Caucasian</SelectItem>
                  <SelectItem value="african_american">African American</SelectItem>
                  <SelectItem value="hispanic">Hispanic</SelectItem>
                  <SelectItem value="asian">Asian</SelectItem>
                  <SelectItem value="native_american">Native American</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admissionType">Admission Type</Label>
              <Select value={formData.admissionType} onValueChange={(value) => handleSelectChange("admissionType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Admission Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="elective">Elective</SelectItem>
                  <SelectItem value="newborn">Newborn</SelectItem>
                  <SelectItem value="trauma">Trauma Center</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dischargeLocation">Discharge Location</Label>
              <Select value={formData.dischargeLocation} onValueChange={(value) => handleSelectChange("dischargeLocation", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Discharge Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="snf">Skilled Nursing Facility</SelectItem>
                  <SelectItem value="rehab">Rehabilitation Center</SelectItem>
                  <SelectItem value="ltac">Long Term Acute Care</SelectItem>
                  <SelectItem value="other">Other Facility</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="drgType">DRG Type</Label>
              <Select value={formData.drgType} onValueChange={(value) => handleSelectChange("drgType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select DRG Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="surgical">Surgical</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                placeholder="Enter weight"
                value={formData.weight}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                name="height"
                type="number"
                placeholder="Enter height"
                value={formData.height}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className="bg-pink-50 rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold border-b pb-2">Clinical Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="creatinine">Creatinine (mg/dL)</Label>
              <Input
                id="creatinine"
                name="creatinine"
                type="number"
                step="0.01"
                placeholder="Enter Creatinine density"
                value={formData.creatinine}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bnp">BNP (pg/mL)</Label>
              <Input
                id="bnp"
                name="bnp"
                type="number"
                placeholder="Enter BNP level"
                value={formData.bnp}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ejectionFraction">Ejection Fraction (%)</Label>
              <Input
                id="ejectionFraction"
                name="ejectionFraction"
                type="number"
                placeholder="Enter ejection rate"
                value={formData.ejectionFraction}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sodium">Sodium (mEq/L)</Label>
              <Input
                id="sodium"
                name="sodium"
                type="number"
                placeholder="Enter Sodium intake"
                value={formData.sodium}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className="bg-pink-50 rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold border-b pb-2">Comorbidities</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="diabetes"
                checked={formData.diabetes}
                onCheckedChange={(checked) => handleCheckboxChange("diabetes", checked as boolean)}
              />
              <Label htmlFor="diabetes">Diabetes</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="copd"
                checked={formData.copd}
                onCheckedChange={(checked) => handleCheckboxChange("copd", checked as boolean)}
              />
              <Label htmlFor="copd">COPD</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hypertension"
                checked={formData.hypertension}
                onCheckedChange={(checked) => handleCheckboxChange("hypertension", checked as boolean)}
              />
              <Label htmlFor="hypertension">Hypertension</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="coronaryArteryDisease"
                checked={formData.coronaryArteryDisease}
                onCheckedChange={(checked) => handleCheckboxChange("coronaryArteryDisease", checked as boolean)}
              />
              <Label htmlFor="coronaryArteryDisease">Coronary Artery Disease</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="chronicKidneyDisease"
                checked={formData.chronicKidneyDisease}
                onCheckedChange={(checked) => handleCheckboxChange("chronicKidneyDisease", checked as boolean)}
              />
              <Label htmlFor="chronicKidneyDisease">Chronic Kidney Disease</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="atrialFibrillation"
                checked={formData.atrialFibrillation}
                onCheckedChange={(checked) => handleCheckboxChange("atrialFibrillation", checked as boolean)}
              />
              <Label htmlFor="atrialFibrillation">Atrial Fibrillation</Label>
            </div>
          </div>
        </div>

        <div className="bg-pink-50 rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold border-b pb-2">Current Medication</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="aceInhibitors"
                checked={formData.aceInhibitors}
                onCheckedChange={(checked) => handleCheckboxChange("aceInhibitors", checked as boolean)}
              />
              <Label htmlFor="aceInhibitors">ACE Inhibitors</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="diuretics"
                checked={formData.diuretics}
                onCheckedChange={(checked) => handleCheckboxChange("diuretics", checked as boolean)}
              />
              <Label htmlFor="diuretics">Diuretics</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="arbs"
                checked={formData.arbs}
                onCheckedChange={(checked) => handleCheckboxChange("arbs", checked as boolean)}
              />
              <Label htmlFor="arbs">ARBs</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="mras"
                checked={formData.mras}
                onCheckedChange={(checked) => handleCheckboxChange("mras", checked as boolean)}
              />
              <Label htmlFor="mras">MRAs</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="betaBlockers"
                checked={formData.betaBlockers}
                onCheckedChange={(checked) => handleCheckboxChange("betaBlockers", checked as boolean)}
              />
              <Label htmlFor="betaBlockers">Beta Blockers</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sglt2Inhibitors"
                checked={formData.sglt2Inhibitors}
                onCheckedChange={(checked) => handleCheckboxChange("sglt2Inhibitors", checked as boolean)}
              />
              <Label htmlFor="sglt2Inhibitors">SGLT2 Inhibitors</Label>
            </div>
          </div>
        </div>

        <div className="bg-pink-50 rounded-lg p-6 space-y-6">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-xl font-semibold">Reports</h2>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowReportForm(true)}
              className="text-pink-600 border-pink-200 hover:bg-pink-50"
            >
              + Add Report
            </Button>
          </div>

          {/* List of added reports would go here */}
          {reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">DRG Code: {report.drgCode}</p>
                      <p className="text-sm text-gray-600">{report.drgDescription}</p>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => handleDeleteReport(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No reports added yet</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
            onClick={handlePredictRisk}
          >
            Predict Risk
          </Button>
          <Button type="submit" className="bg-pink-600 hover:bg-pink-700" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Enter Data"}
          </Button>
        </div>
      </form>


    </div>
  )
}
