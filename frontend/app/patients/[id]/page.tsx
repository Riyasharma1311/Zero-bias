'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { usePatients } from '@/hooks/usePatients';
import { PatientVitalsCard } from '@/components/PatientVitalsCard';
import { VitalSignsHistory } from '@/components/VitalSignsHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

export default function PatientDetailsPage() {
  const params = useParams();
  const patientId = parseInt(params.id as string);
  const { patient, loading, error, fetchPatient } = usePatients();

  useEffect(() => {
    fetchPatient(patientId);
  }, [fetchPatient, patientId]);

  if (loading) {
    return <div>Loading patient data...</div>;
  }

  if (error) {
    return <div>Error loading patient data: {error.message}</div>;
  }

  if (!patient) {
    return <div>Patient not found</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium">Full Name</p>
              <p>{patient.full_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Date of Birth</p>
              <p>{formatDate(patient.date_of_birth)}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Gender</p>
              <p className="capitalize">{patient.gender}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Blood Type</p>
              <p>{patient.blood_type || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Height</p>
              <p>{patient.height ? `${patient.height} cm` : 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Weight</p>
              <p>{patient.weight ? `${patient.weight} kg` : 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Contact Number</p>
              <p>{patient.contact_number || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p>{patient.email || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Address</p>
              <p>{patient.address || 'Not specified'}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {patient.allergies && (
              <div>
                <p className="text-sm font-medium">Allergies</p>
                <p>{patient.allergies}</p>
              </div>
            )}
            {patient.chronic_conditions && (
              <div>
                <p className="text-sm font-medium">Chronic Conditions</p>
                <p>{patient.chronic_conditions}</p>
              </div>
            )}
            {patient.current_medications && (
              <div>
                <p className="text-sm font-medium">Current Medications</p>
                <p>{patient.current_medications}</p>
              </div>
            )}
            {patient.family_history && (
              <div>
                <p className="text-sm font-medium">Family History</p>
                <p>{patient.family_history}</p>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Emergency Contact</p>
              <p>{patient.emergency_contact_name || 'Not specified'}</p>
              <p>{patient.emergency_contact_number || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Insurance Information</p>
              <p>Provider: {patient.insurance_provider || 'Not specified'}</p>
              <p>ID: {patient.insurance_id || 'Not specified'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <PatientVitalsCard patientId={patientId} />
      <VitalSignsHistory patientId={patientId} />
    </div>
  );
}
