'use client';

import { useState } from 'react';
import { useVitalSigns } from '@/hooks/useVitalSigns';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { VitalSignsCreate } from '@/types/api';

export default function RecordVitalsPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = parseInt(params.id as string);
  const { createVitalSigns } = useVitalSigns({ patientId });

  const [formData, setFormData] = useState<VitalSignsCreate>({
    measured_at: new Date().toISOString(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createVitalSigns(formData);
      router.push(`/patients/${patientId}`);
    } catch (error) {
      console.error('Failed to record vital signs:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: VitalSignsCreate) => ({
      ...prev,
      [name]: value === '' ? undefined : name === 'notes' ? value : parseFloat(value),
    }));
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Record Vital Signs</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heart_rate">Heart Rate (bpm)</Label>
                <Input
                  id="heart_rate"
                  name="heart_rate"
                  type="number"
                  min="0"
                  max="300"
                  step="1"
                  value={formData.heart_rate || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Blood Pressure (mmHg)</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      name="blood_pressure_systolic"
                      type="number"
                      min="0"
                      max="300"
                      placeholder="Systolic"
                      value={formData.blood_pressure_systolic || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      name="blood_pressure_diastolic"
                      type="number"
                      min="0"
                      max="300"
                      placeholder="Diastolic"
                      value={formData.blood_pressure_diastolic || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature (°C)</Label>
                <Input
                  id="temperature"
                  name="temperature"
                  type="number"
                  min="30"
                  max="45"
                  step="0.1"
                  value={formData.temperature || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="respiratory_rate">Respiratory Rate (/min)</Label>
                <Input
                  id="respiratory_rate"
                  name="respiratory_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.respiratory_rate || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="oxygen_saturation">Oxygen Saturation (%)</Label>
                <Input
                  id="oxygen_saturation"
                  name="oxygen_saturation"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.oxygen_saturation || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/patients/${patientId}`)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Vital Signs</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 