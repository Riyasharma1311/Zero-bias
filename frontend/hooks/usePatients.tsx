import { useState, useCallback } from "react";
import { Patient, PatientCreate, PatientUpdate, Report } from "@/types/api";
import { apiClient } from "@/lib/api-client";

interface UsePatientReturn {
  patients: Patient[];
  patient: Patient | null;
  loading: boolean;
  error: Error | null;
  fetchPatients: () => Promise<void>;
  fetchPatient: (id: number) => Promise<void>;
  createPatient: (data: PatientCreate) => Promise<Patient>;
  updatePatient: (patientId: number, data: PatientUpdate) => Promise<Patient>;
  createReports: (patientId: number, reports: Report[]) => Promise<Report[]>;
  deleteReports: (reportId: number, patientId: number) => Promise<Report[]>;
}

export function usePatients(): UsePatientReturn {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<Patient[]>("/api/v1/patients");
      setPatients(response.data);
    } catch (err) {
      setError(err as Error);
      console.error("Failed to fetch patients:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPatient = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<Patient>(`/api/v1/patients/${id}`);
      setPatient(response.data);
    } catch (err) {
      setError(err as Error);
      console.error("Failed to fetch patient:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPatient = useCallback(async (data: PatientCreate) => {
    setLoading(true);
    setError(null);
    try {
      // @ts-ignore
      data.date_of_birth = new Date(data["DOB"]);
      const response = await apiClient.post<Patient>("/api/v1/patients", data);
      setPatients((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err as Error);
      console.error("Failed to create patient:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePatient = useCallback(
    async (patientId: number, data: PatientUpdate) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.put<Patient>(
          `/api/v1/patients/${patientId}`,
          data
        );
        setPatients((prev) =>
          prev.map((p) => (p.id === patientId ? response.data : p))
        );
        if (patient?.id === patientId) {
          setPatient(response.data);
        }
        return response.data;
      } catch (err) {
        setError(err as Error);
        console.error("Failed to update patient:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [patient]
  );

  const createReports = useCallback(
    async (patientId: number, reports: Report[]) => {
      setLoading(true);
      setError(null);
      try {
        for (const report of reports) {
          await apiClient.post<Report>(
            `/api/v1/patients/${patientId}/reports`,
            report
          );
        }
        return reports;
      } catch (err) {
        setError(err as Error);
        console.error("Failed to create reports:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteReports = useCallback(
    async (reportId: number, patientId: number) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.delete<Report[]>(
          `/api/v1/patients/${patientId}/reports/${reportId}`
        );
        return response.data;
      } catch (err) {
        setError(err as Error);
        console.error("Failed to delete reports:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    patients,
    patient,
    loading,
    error,
    fetchPatients,
    fetchPatient,
    createPatient,
    updatePatient,
    createReports,
    deleteReports,
  };
}
