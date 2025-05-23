import { useEffect } from 'react';
import { useVitalSigns } from '@/hooks/useVitalSigns';
import { useRiskAssessment } from '@/hooks/useRiskAssessment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface PatientVitalsCardProps {
  patientId: number;
}

export function PatientVitalsCard({ patientId }: PatientVitalsCardProps) {
  const router = useRouter();
  const { latestVitalSigns, loading: vitalsLoading, error: vitalsError, fetchLatestVitalSigns } = useVitalSigns({ patientId });
  const { latestAssessment, loading: assessmentLoading, error: assessmentError, createRiskAssessment } = useRiskAssessment({ patientId });

  useEffect(() => {
    fetchLatestVitalSigns();
  }, [fetchLatestVitalSigns]);

  const handleCreateAssessment = async () => {
    try {
      await createRiskAssessment();
    } catch (error) {
      console.error('Failed to create risk assessment:', error);
    }
  };

  if (vitalsLoading || assessmentLoading) {
    return <div>Loading patient data...</div>;
  }

  if (vitalsError || assessmentError) {
    return <div>Error loading patient data</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Latest Vital Signs</CardTitle>
          <Button onClick={() => router.push(`/patients/${patientId}/record-vitals`)}>
            Record New
          </Button>
        </CardHeader>
        <CardContent>
          {!latestVitalSigns ? (
            <p>No vital signs recorded yet.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Heart Rate</p>
                  <p>{latestVitalSigns.heart_rate ? `${latestVitalSigns.heart_rate} bpm` : 'Not recorded'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Blood Pressure</p>
                  <p>
                    {latestVitalSigns.blood_pressure_systolic && latestVitalSigns.blood_pressure_diastolic
                      ? `${latestVitalSigns.blood_pressure_systolic}/${latestVitalSigns.blood_pressure_diastolic} mmHg`
                      : 'Not recorded'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Temperature</p>
                  <p>{latestVitalSigns.temperature ? `${latestVitalSigns.temperature}°C` : 'Not recorded'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Respiratory Rate</p>
                  <p>{latestVitalSigns.respiratory_rate ? `${latestVitalSigns.respiratory_rate}/min` : 'Not recorded'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Oxygen Saturation</p>
                  <p>{latestVitalSigns.oxygen_saturation ? `${latestVitalSigns.oxygen_saturation}%` : 'Not recorded'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Measured At</p>
                  <p>{formatDate(latestVitalSigns.measured_at)}</p>
                </div>
              </div>
              {latestVitalSigns.notes && (
                <div>
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-sm">{latestVitalSigns.notes}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Risk Assessment</CardTitle>
          <Button onClick={handleCreateAssessment}>
            New Assessment
          </Button>
        </CardHeader>
        <CardContent>
          {!latestAssessment ? (
            <p>No risk assessment available.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-medium">Heart Attack Risk</p>
                  <p className="text-sm">{latestAssessment.heart_attack_risk}%</p>
                </div>
                <Progress value={latestAssessment.heart_attack_risk} />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-medium">Stroke Risk</p>
                  <p className="text-sm">{latestAssessment.stroke_risk}%</p>
                </div>
                <Progress value={latestAssessment.stroke_risk} />
              </div>
              <div>
                <p className="text-sm font-medium">Cardiovascular Age</p>
                <p>{latestAssessment.cardiovascular_age} years</p>
              </div>
              <div>
                <p className="text-sm font-medium">Confidence Score</p>
                <p>{(latestAssessment.confidence_score * 100).toFixed(1)}%</p>
              </div>
              {latestAssessment.recommendations && latestAssessment.recommendations.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Recommendations</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {latestAssessment.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                <p>Last assessed: {formatDate(latestAssessment.assessed_at)}</p>
                <p>Model version: {latestAssessment.model_version}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 