import axios, { AxiosError } from 'axios';
import type { User } from '@/types/user';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем перехватчик для запросов
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Добавляем перехватчик для ответов
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  login: string;
  phoneNumber: string;
  typeOfAccount: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      throw error;
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
    } catch (error) {
      throw error;
    }
  },

  async getMe(): Promise<{ user: User }> {
    try {
      const response = await api.get<{ user: User }>('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export interface SecuritySettings {
  loginNotifications: boolean;
  activityLogging: {
    enabled: boolean;
    retentionPeriod: number;
    detailLevel: 'basic' | 'standard' | 'detailed' | 'debug';
  };
  failedLoginLimit: boolean;
  ipRestrictions: {
    enabled: boolean;
    allowedIps: string[];
  };
  timeRestrictions: {
    enabled: boolean;
    workDaysOnly: boolean;
    startTime: string;
    endTime: string;
  };
  geoRestrictions: {
    enabled: boolean;
    allowedCountries: string[];
  };
}

export const securityApi = {
  async getSettings(): Promise<{ settings: SecuritySettings }> {
    try {
      const response = await api.get('/security/settings');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateSettings(settings: SecuritySettings): Promise<{ settings: SecuritySettings }> {
    try {
      const response = await api.put('/security/settings', settings);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export interface ActivityLog {
  _id: string;
  timestamp: string;
  action: string;
  ipAddress: string;
  deviceInfo: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  details?: Record<string, any>;
}

export { api }; 