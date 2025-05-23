import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

// API base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private static instance: ApiClient;
  private client: AxiosInstance;

  private constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for adding auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for handling errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Clear invalid token
          localStorage.removeItem('access_token');
          // Redirect to login page
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await this.client.post('/api/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    const { access_token } = response.data;
    document.cookie = `access_token=${access_token}`;
    localStorage.setItem('access_token', access_token);
    return response.data;
  }

  async register(userData: {
    email: string;
    password: string;
    full_name: string;
    role?: 'doctor' | 'admin';
    specialization?: string;
    license_number?: string;
  }) {
    return this.client.post('/api/v1/auth/register', userData);
  }

  async getCurrentUser() {
    return this.client.get('/api/v1/auth/me');
  }

  // Patient endpoints
  async getPatients(params?: { skip?: number; limit?: number }) {
    return this.client.get('/api/v1/patients', { params });
  }

  async getPatient(patientId: number) {
    return this.client.get(`/api/v1/patients/${patientId}`);
  }

  async createPatient(patientData: any) {
    return this.client.post('/api/v1/patients', patientData);
  }

  async updatePatient(patientId: number, patientData: any) {
    return this.client.put(`/api/v1/patients/${patientId}`, patientData);
  }

  // Vital signs endpoints
  async getPatientVitals(patientId: number, params?: { start_date?: string; end_date?: string }) {
    return this.client.get(`/api/v1/patients/${patientId}/vitals`, { params });
  }

  async createVitalSigns(patientId: number, vitalsData: any) {
    return this.client.post(`/api/v1/patients/${patientId}/vitals`, vitalsData);
  }

  async getLatestVitals(patientId: number) {
    return this.client.get(`/api/v1/patients/${patientId}/vitals/latest`);
  }

  // Risk assessment endpoints
  async createRiskAssessment(patientId: number) {
    return this.client.post(`/api/v1/patients/${patientId}/risk-assessment`);
  }

  async getRiskAssessments(patientId: number) {
    return this.client.get(`/api/v1/patients/${patientId}/risk-assessments`);
  }

  async updateRiskAssessment(patientId: number, assessmentId: number, data: { recommendations: string[] }) {
    return this.client.put(
      `/api/v1/patients/${patientId}/risk-assessments/${assessmentId}`,
      data
    );
  }

  // Medical records endpoints
  async getMedicalRecords(patientId: number) {
    return this.client.get(`/api/v1/patients/${patientId}/records`);
  }

  async createMedicalRecord(patientId: number, recordData: FormData) {
    return this.client.post(`/api/v1/patients/${patientId}/records`, recordData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async downloadMedicalRecord(patientId: number, recordId: number) {
    return this.client.get(
      `/api/v1/patients/${patientId}/records/${recordId}/download`,
      { responseType: 'blob' }
    );
  }

  // Generic request methods
  async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.get<T>(url, config);
    return response;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.post<T>(url, data, config);
    return response;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.put<T>(url, data, config);
    return response;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.delete<T>(url, config);
    return response;
  }
}

export const apiClient = ApiClient.getInstance(); 