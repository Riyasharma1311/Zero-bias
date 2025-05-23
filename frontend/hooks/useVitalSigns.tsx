import { useState, useCallback } from 'react';
import { VitalSigns, VitalSignsCreate } from '@/types/api';
import { apiClient } from '@/lib/api-client';

interface UseVitalSignsProps {
  patientId: number;
}

interface UseVitalSignsReturn {
  vitalSigns: VitalSigns[];
  latestVitalSigns: VitalSigns | null;
  loading: boolean;
  error: Error | null;
  fetchVitalSigns: () => Promise<void>;
  fetchLatestVitalSigns: () => Promise<void>;
  createVitalSigns: (data: VitalSignsCreate) => Promise<VitalSigns>;
}

export function useVitalSigns({ patientId }: UseVitalSignsProps): UseVitalSignsReturn {
  const [vitalSigns, setVitalSigns] = useState<VitalSigns[]>([]);
  const [latestVitalSigns, setLatestVitalSigns] = useState<VitalSigns | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchVitalSigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<VitalSigns[]>(`/api/v1/patients/${patientId}/vitals`);
      setVitalSigns(response.data);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch vital signs:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const fetchLatestVitalSigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<VitalSigns>(`/api/v1/patients/${patientId}/vitals/latest`);
      setLatestVitalSigns(response.data);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch latest vital signs:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const createVitalSigns = useCallback(async (data: VitalSignsCreate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<VitalSigns>(`/api/v1/patients/${patientId}/vitals`, data);
      setVitalSigns(prev => [...prev, response.data]);
      setLatestVitalSigns(response.data);
      return response.data;
    } catch (err) {
      setError(err as Error);
      console.error('Failed to create vital signs:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  return {
    vitalSigns,
    latestVitalSigns,
    loading,
    error,
    fetchVitalSigns,
    fetchLatestVitalSigns,
    createVitalSigns,
  };
} 