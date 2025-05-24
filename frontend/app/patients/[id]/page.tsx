"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { usePatients } from "@/hooks/usePatients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Report } from "@/types/api";
import { apiClient } from "@/lib/api-client";
import { Loader2, AlertCircle, FileText, Activity, Trash2, Heart } from "lucide-react";
import Link from "next/link";

export default function PatientDetailsPage() {
  const params = useParams();
  const patientId = parseInt(params.id as string);
  const { patient, loading, error, fetchPatient, deleteReports } =
    usePatients();

  useEffect(() => {
    fetchPatient(patientId);
  }, [fetchPatient, patientId]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg text-gray-600">
          Loading patient data...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-semibold text-red-700">Error</h3>
          <p className="text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="rounded-lg bg-gray-50 p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-500" />
          <p className="mt-2 text-lg text-gray-600">Patient not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Card className="shadow-lg">
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
              <h1 className="text-3xl font-bold">Patient Details</h1>
              <p className="text-muted-foreground">
                View patient details and medical reports
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: "Full Name", value: patient.full_name },
              {
                label: "Date of Birth",
                value: formatDate(patient.date_of_birth),
              },
              { label: "Gender", value: patient.gender, capitalize: true },
              { label: "Blood Type", value: patient.blood_type },
              {
                label: "Height",
                value: patient.height ? `${patient.height} cm` : null,
              },
              {
                label: "Weight",
                value: patient.weight ? `${patient.weight} kg` : null,
              },
              { label: "Contact Number", value: patient.contact_number },
              { label: "Email", value: patient.email },
              { label: "Address", value: patient.address },
            ].map((field, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow-sm border">
                <p className="text-sm font-medium text-gray-600">
                  {field.label}
                </p>
                <p className={`mt-1 ${field.capitalize ? "capitalize" : ""}`}>
                  {field.value || "Not specified"}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Allergies", value: patient.allergies },
              {
                label: "Chronic Conditions",
                value: patient.chronic_conditions,
              },
              {
                label: "Current Medications",
                value: patient.current_medications,
              },
              { label: "Family History", value: patient.family_history },
            ].map(
              (section, i) =>
                section.value && (
                  <div
                    key={i}
                    className="bg-white p-4 rounded-lg shadow-sm border"
                  >
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      {section.label}
                    </p>
                    <p className="text-gray-700">{section.value}</p>
                  </div>
                )
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <p className="text-sm font-medium text-gray-600 mb-2">
                Emergency Contact
              </p>
              <p className="text-gray-700">
                {patient.emergency_contact_name || "Not specified"}
              </p>
              <p className="text-gray-700">
                {patient.emergency_contact_number || "Not specified"}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <p className="text-sm font-medium text-gray-600 mb-2">
                Insurance Information
              </p>
              <p className="text-gray-700">
                Provider: {patient.insurance_provider || "Not specified"}
              </p>
              <p className="text-gray-700">
                ID: {patient.insurance_id || "Not specified"}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Medical Reports
            </h2>
            <div className="space-y-4">
              {patient.reports?.map((report: Report, index: number) => (
                <div
                  key={`${report.drg_code}-${index}`}
                  className="bg-white rounded-lg shadow-sm border p-6"
                >
                  <div className="flex justify-between flex-wrap gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center">
                        <Activity className="h-5 w-5 text-blue-500 mr-2" />
                        <p className="font-semibold text-lg">
                          DRG Code: {report.drg_code}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">DRG Description:</p>
                          <p className="text-gray-800">
                            {report.drg_description}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">DRG Severity:</p>
                          <p className="text-gray-800">{report.drg_severity}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">DRG Mortality:</p>
                          <p className="text-gray-800">
                            {report.drg_mortality}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">CPT Codes:</p>
                          <p className="text-gray-800">{report.cpt_codes}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">ICD-9 Codes:</p>
                          <p className="text-gray-800">{report.icd9_codes}</p>
                        </div>
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-600">Procedure Pairs:</p>
                        <p className="text-gray-800 break-all">
                          {JSON.stringify(report.procedure_pairs)}
                        </p>
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-600">Lab Events:</p>
                        <p className="text-gray-800 break-all">
                          {JSON.stringify(report.lab_events)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <form
                        action="https://hf-readmission.onrender.com/predict"
                        method="POST"
                        className="w-full"
                      >
                        {/* Hidden inputs preserved but condensed for readability */}
                        {Object.entries({
                          admission_type: patient.admission_type,
                          discharge_location: patient.discharge_location,
                          ethnicity: patient.ethnicity,
                          cpt_cd: report.cpt_codes,
                          all_diagnosis: report.icd9_codes,
                          gender: patient.gender,
                          age:
                            new Date().getFullYear() -
                            new Date(patient.date_of_birth).getFullYear(),
                          drg_type: patient.drg_type,
                          drg_code: report.drg_code,
                          description: report.drg_description,
                          drg_severity: report.drg_severity,
                          drg_mortality: report.drg_mortality,
                          procedure_pairs: JSON.stringify(
                            report.procedure_pairs
                          ),
                          lab_events: report.lab_events,
                          submit: "true",
                        }).map(([name, value]) => (
                          <input
                            key={name}
                            type="hidden"
                            name={name}
                            value={value}
                          />
                        ))}
                        <Button
                          type="submit"
                          variant="outline"
                          className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                        >
                          Predict Risks
                        </Button>
                      </form>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => deleteReports(report.id!, patientId)}
                        className="w-full flex items-center justify-center"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
