'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePatients } from '@/hooks/usePatients';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PatientCreate, Gender, BloodType } from '@/types/api';

export default function NewPatientPage() {
  const router = useRouter();
  const { createPatient } = usePatients();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<PatientCreate>>({
    gender: 'male',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createPatient(formData as PatientCreate);
      router.push('/patients');
    } catch (error) {
      console.error('Failed to create patient:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Patient</CardTitle>
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
                  value={formData.full_name || ''}
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
                  onChange={e => handleInputChange({
                    ...e,
                    target: { name: 'DOB', value: new Date(e.target.value).toISOString() }
                  } as React.ChangeEvent<HTMLInputElement>)}
                />
              </div>

              <div className="space-y-2">
                <Label>Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={handleSelectChange('gender')}
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
                  onValueChange={handleSelectChange('blood_type')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
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
                  value={formData.contact_number || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address || ''}
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
                  value={formData.height || ''}
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
                  value={formData.weight || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Input
                id="allergies"
                name="allergies"
                value={formData.allergies || ''}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chronic_conditions">Chronic Conditions</Label>
              <Input
                id="chronic_conditions"
                name="chronic_conditions"
                value={formData.chronic_conditions || ''}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_medications">Current Medications</Label>
              <Input
                id="current_medications"
                name="current_medications"
                value={formData.current_medications || ''}
                onChange={handleInputChange}
              />
            </div>

            {/* Emergency Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                <Input
                  id="emergency_contact_name"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_number">Emergency Contact Number</Label>
                <Input
                  id="emergency_contact_number"
                  name="emergency_contact_number"
                  value={formData.emergency_contact_number || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Insurance Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="insurance_provider">Insurance Provider</Label>
                <Input
                  id="insurance_provider"
                  name="insurance_provider"
                  value={formData.insurance_provider || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="insurance_id">Insurance ID</Label>
                <Input
                  id="insurance_id"
                  name="insurance_id"
                  value={formData.insurance_id || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/patients')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Patient'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
