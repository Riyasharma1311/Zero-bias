"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Report } from "@/types/api";
interface PatientReportFormProps {
  onSubmit: (data: Report) => void;
  onCancel: () => void;
}

export function PatientReportForm({
  onSubmit,
  onCancel,
}: PatientReportFormProps) {
  const [formData, setFormData] = useState<Report>({
    drg_code: "",
    drg_description: "",
    drg_severity: "",
    drg_mortality: "",
    cpt_codes: "",
    icd9_codes: "",
    procedure_pairs: "",
    lab_events: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">DRG Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="drg_code">DRG Code</Label>
                <Input
                  id="drg_code"
                  name="drg_code"
                  placeholder="Enter DRG code"
                  value={formData.drg_code}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="drg_description">DRG Description</Label>
                <Input
                  id="drg_description"
                  name="drg_description"
                  placeholder="Enter DRG description"
                  value={formData.drg_description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="drg_severity">DRG Severity (0-4)</Label>
                <Select
                  value={formData.drg_severity}
                  onValueChange={(value) =>
                    handleSelectChange("drg_severity", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4].map((value) => (
                      <SelectItem key={value} value={value.toString()}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="drg_mortality">DRG Mortality (0-4)</Label>
                <Select
                  value={formData.drg_mortality}
                  onValueChange={(value) =>
                    handleSelectChange("drg_mortality", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Mortality" />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4].map((value) => (
                      <SelectItem key={value} value={value.toString()}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Medical Codes & Procedures
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cptCodes">CPT Codes (comma separated)</Label>
                <Input
                  id="cpt_codes"
                  name="cpt_codes"
                  placeholder="e.g., 99291, 99233, 99239"
                  value={formData.cpt_codes}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icd9Codes">
                  ICD9 Diagnosis Codes (comma separated)
                </Label>
                <Input
                  id="icd9_codes"
                  name="icd9_codes"
                  placeholder="e.g., 99749, 0389, 99591"
                  value={formData.icd9_codes}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="procedurePairs">
                  Procedure Pairs (JSON format)
                </Label>
                <Textarea
                  id="procedure_pairs"
                  name="procedure_pairs"
                  placeholder="e.g., [[1, 311], [2, 3323]]"
                  value={formData.procedure_pairs}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lab_events">
                  Lab Events (comma separated format)
                </Label>
                <Textarea
                  id="lab_events"
                  name="lab_events"
                  placeholder="e.g., 51279, 4.72, normal, 6.43, 51275, 334, normal, 5.45"
                  value={formData.lab_events}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Add Report</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
