import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

interface MedicalRecord {
  id: number;
  patient_id: number;
  title: string;
  description?: string;
  record_type: string;
  recorded_at: string;
  file_path: string | null;
  mime_type: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

interface UseMedicalRecordsOptions {
  patientId: number;
}

export function useMedicalRecords({ patientId }: UseMedicalRecordsOptions) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getMedicalRecords(patientId);
      setRecords(response.data);
    } catch (err) {
      setError('Failed to fetch medical records');
      console.error('Error fetching medical records:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const createRecord = async (recordData: FormData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.createMedicalRecord(patientId, recordData);
      setRecords(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError('Failed to create medical record');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downloadRecord = async (recordId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.downloadMedicalRecord(patientId, recordId);
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `medical-record-${recordId}${getFileExtension(response.headers['content-type'])}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download medical record');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    records,
    loading,
    error,
    fetchRecords,
    createRecord,
    downloadRecord,
  };
}

// Helper function to get file extension from MIME type
function getFileExtension(mimeType: string | undefined): string {
  if (!mimeType) return '';
  
  const extensions: Record<string, string> = {
    'application/pdf': '.pdf',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt',
  };

  return extensions[mimeType] || '';
} 