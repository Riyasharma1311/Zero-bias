import { useEffect } from 'react';
import { useVitalSigns } from '@/hooks/useVitalSigns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

interface VitalSignsHistoryProps {
  patientId: number;
}

export function VitalSignsHistory({ patientId }: VitalSignsHistoryProps) {
  const router = useRouter();
  const { vitalSigns, loading, error, fetchVitalSigns } = useVitalSigns({ patientId });

  useEffect(() => {
    fetchVitalSigns();
  }, [fetchVitalSigns]);

  if (loading) {
    return <div>Loading vital signs...</div>;
  }

  if (error) {
    return <div>Error loading vital signs: {error.message}</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Vital Signs History</CardTitle>
        <Button onClick={() => router.push(`/patients/${patientId}/record-vitals`)}>
          Record Vitals
        </Button>
      </CardHeader>
      <CardContent>
        {vitalSigns.length === 0 ? (
          <p>No vital signs recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {vitalSigns.map((vitals) => (
              <Card key={vitals.id} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">Heart Rate</p>
                    <p>{vitals.heart_rate ? `${vitals.heart_rate} bpm` : 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Blood Pressure</p>
                    <p>
                      {vitals.blood_pressure_systolic && vitals.blood_pressure_diastolic
                        ? `${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic} mmHg`
                        : 'Not recorded'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Temperature</p>
                    <p>{vitals.temperature ? `${vitals.temperature}°C` : 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Respiratory Rate</p>
                    <p>
                      {vitals.respiratory_rate ? `${vitals.respiratory_rate}/min` : 'Not recorded'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Oxygen Saturation</p>
                    <p>
                      {vitals.oxygen_saturation ? `${vitals.oxygen_saturation}%` : 'Not recorded'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Measured At</p>
                    <p>{formatDate(vitals.measured_at)}</p>
                  </div>
                </div>
                {vitals.notes && (
                  <div className="mt-4">
                    <p className="text-sm font-medium">Notes</p>
                    <p className="text-sm">{vitals.notes}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 