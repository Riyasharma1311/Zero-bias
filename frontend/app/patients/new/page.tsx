"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePatients } from "@/hooks/usePatients";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PatientCreate, Report } from "@/types/api";
import { PatientReportForm } from "@/components/patients/PatientReportForm";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function NewPatientPage() {
  const router = useRouter();
  const { createPatient, createReports } = usePatients();
  const [loading, setLoading] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);

  const [formData, setFormData] = useState<Partial<PatientCreate>>({
    gender: "male",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const patient = await createPatient(formData as PatientCreate);
      await createReports(
        patient.id,
        reports.map((report) => ({
          ...report,
          cpt_codes: Array.isArray(report.cpt_codes)
            ? report.cpt_codes
            : report.cpt_codes.split(","),
          icd9_codes: Array.isArray(report.icd9_codes)
            ? report.icd9_codes
            : report.icd9_codes.split(","),
          procedure_pairs: Array.isArray(report.procedure_pairs)
            ? report.procedure_pairs
            : // @ts-ignore
              JSON.parse(report.procedure_pairs),
          lab_events: Array.isArray(report.lab_events)
            ? report.lab_events
            : // @ts-ignore
              JSON.parse(report.lab_events.split(",")),
        }))
      );
      router.push("/patients");
    } catch (error) {
      console.error("Failed to create patient:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReport = (report: Report) => {
    setReports((prev: Report[]) => [...prev, report]);
    setShowReportForm(false);
  };

  const handleDeleteReport = (index: number) => {
    setReports((prev: Report[]) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-6">
            <Link
              href="/dashboard"
              className="text-pink-600 hover:text-pink-700 flex items-center"
            >
              <span className="mr-2">←</span> Heart Sync
            </Link>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="text-pink-600">
              <Heart className="h-12 w-12" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">New Patient</h1>
              <p className="text-muted-foreground">
                Enter patient information to predict heart failure readmission
                risk
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  required
                  value={formData.full_name || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  required
                  value={formData.date_of_birth}
                  onChange={(e) =>
                    handleInputChange({
                      ...e,
                      target: {
                        name: "DOB",
                        value: new Date(e.target.value).toISOString(),
                      },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={handleSelectChange("gender")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Blood Type</Label>
                <Select
                  value={formData.blood_type}
                  onValueChange={handleSelectChange("blood_type")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                      (type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <Label htmlFor="contact_number">Contact Number</Label>
                <Input
                  id="contact_number"
                  name="contact_number"
                  type="tel"
                  value={formData.contact_number || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleInputChange}
                />
              </div>

              {/* Physical Characteristics */}
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  min="0"
                  max="300"
                  value={formData.height || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  min="0"
                  max="1000"
                  value={formData.weight || ""}
                  onChange={handleInputChange}
                />
              </div>

              {/* Medical Information */}
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Input
                  id="allergies"
                  name="allergies"
                  value={formData.allergies || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chronic_conditions">Chronic Conditions</Label>
                <Input
                  id="chronic_conditions"
                  name="chronic_conditions"
                  value={formData.chronic_conditions || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="current_medications">Current Medications</Label>
                <Input
                  id="current_medications"
                  name="current_medications"
                  value={formData.current_medications || ""}
                  onChange={handleInputChange}
                />
              </div>
              {/* Emergency Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_name">
                    Emergency Contact Name
                  </Label>
                  <Input
                    id="emergency_contact_name"
                    name="emergency_contact_name"
                    value={formData.emergency_contact_name || ""}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_number">
                    Emergency Contact Number
                  </Label>
                  <Input
                    id="emergency_contact_number"
                    name="emergency_contact_number"
                    value={formData.emergency_contact_number || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ethnicity">Ethnicity</Label>
                <Select
                  value={formData.ethnicity}
                  onValueChange={handleSelectChange("ethnicity")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Ethnicity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="caucasian">Caucasian</SelectItem>
                    <SelectItem value="african_american">
                      African American
                    </SelectItem>
                    <SelectItem value="hispanic">Hispanic</SelectItem>
                    <SelectItem value="asian">Asian</SelectItem>
                    <SelectItem value="native_american">
                      Native American
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admissionType">Admission Type</Label>
                <Select
                  value={formData.admissionType}
                  onValueChange={handleSelectChange("admissionType")}
                >
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
                <Select
                  value={formData.dischargeLocation}
                  onValueChange={handleSelectChange("dischargeLocation")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Discharge Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="snf">
                      Skilled Nursing Facility
                    </SelectItem>
                    <SelectItem value="rehab">Rehabilitation Center</SelectItem>
                    <SelectItem value="ltac">Long Term Acute Care</SelectItem>
                    <SelectItem value="other">Other Facility</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="drgType">DRG Type</Label>
                <Select
                  value={formData.drgType}
                  onValueChange={handleSelectChange("drgType")}
                >
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
                          <p className="font-medium">
                            DRG Code: {report.drg_code}
                          </p>
                          <p className="text-sm text-gray-600">
                            {report.drg_description}
                          </p>
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
                <p className="text-gray-500 text-center py-4">
                  No reports added yet
                </p>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/patients")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Patient"}
              </Button>
            </div>
          </form>
          {/* Add Report Form Modal */}
          {showReportForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-4">
                    Add Patient Report
                  </h2>
                  <PatientReportForm
                    onSubmit={handleAddReport}
                    onCancel={() => setShowReportForm(false)}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
