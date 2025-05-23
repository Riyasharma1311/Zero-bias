'use client';

import { useEffect } from 'react';
import { usePatients } from '@/hooks/usePatients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function PatientsPage() {
  const router = useRouter();
  const { patients, loading, error, fetchPatients } = usePatients();

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Patients</h1>
        <Button onClick={() => router.push('/patients/new')}>
          Add New Patient
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          // Loading skeletons
          Array(6).fill(0).map((_, i) => (
            <Card key={i} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <Skeleton className="h-6 w-2/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))
        ) : (
          // Patient cards
          patients.map((patient) => (
            <Card
              key={patient.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/patients/${patient.id}`)}
            >
              <CardHeader>
                <CardTitle>{patient.full_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{patient.gender}</Badge>
                    {patient.blood_type && (
                      <Badge variant="secondary">{patient.blood_type}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Born: {new Date(patient.date_of_birth).toLocaleDateString()}
                  </p>
                  {patient.contact_number && (
                    <p className="text-sm text-gray-500">
                      📞 {patient.contact_number}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 