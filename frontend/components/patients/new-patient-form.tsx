"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function NewPatientForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    // Demographics
    age: "",
    gender: "",
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real app, you would submit this data to your API
      // For demo purposes, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirect to dashboard after successful submission
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
                placeholder="Enter age"
                value={formData.age}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Male / Female" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
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
