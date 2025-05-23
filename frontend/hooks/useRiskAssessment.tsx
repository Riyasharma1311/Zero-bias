import { useState, useCallback } from 'react';
import { RiskAssessment } from '@/types/api';
import { apiClient } from '@/lib/api-client';

interface UseRiskAssessmentProps {
  patientId: number;
}

interface UseRiskAssessmentReturn {
  latestAssessment: RiskAssessment | null;
  loading: boolean;
  error: Error | null;
  createRiskAssessment: () => Promise<RiskAssessment>;
  updateRecommendations: (assessmentId: number, recommendations: string[]) => Promise<RiskAssessment>;
}

export function useRiskAssessment({ patientId }: UseRiskAssessmentProps): UseRiskAssessmentReturn {
  const [latestAssessment, setLatestAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createRiskAssessment = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<RiskAssessment>(`/api/v1/patients/${patientId}/risk-assessment`);
      setLatestAssessment(response.data);
      return response.data;
    } catch (err) {
      setError(err as Error);
      console.error('Failed to create risk assessment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const updateRecommendations = useCallback(async (assessmentId: number, recommendations: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.put<RiskAssessment>(
        `/api/v1/patients/${patientId}/risk-assessments/${assessmentId}`,
        { recommendations }
      );
      setLatestAssessment(response.data);
      return response.data;
    } catch (err) {
      setError(err as Error);
      console.error('Failed to update risk assessment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  return {
    latestAssessment,
    loading,
    error,
    createRiskAssessment,
    updateRecommendations,
  };
} 