// API Base URL - empty for same-origin (Vite proxy in dev, or same domain in prod)
// Set VITE_API_URL env var for production backend
// @ts-ignore - Vite env types
const API_BASE = (import.meta as any).env?.VITE_API_URL || '';

// Get auth token from localStorage
const getToken = () => localStorage.getItem('timetable_token');

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    // Handle case where detail might be an object
    const errorMessage = typeof error.detail === 'string' 
      ? error.detail 
      : (error.detail ? JSON.stringify(error.detail) : `HTTP error! status: ${response.status}`);
    throw new Error(errorMessage);
  }
  
  if (response.status === 204) {
    return undefined as T;
  }
  
  return response.json();
}

// Types
export interface Event {
  id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  days: number[];
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface EventCreate {
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  days: number[];
  color: string;
  icon: string;
}

export interface EventUpdate extends Partial<EventCreate> {}

export interface Settings {
  timezone: string;
  notifications_enabled: boolean;
  theme: string;
  pin_is_set: boolean;
}

export interface AuthStatus {
  pin_is_set: boolean;
}

// API methods
export const api = {
  events: {
    list: () => apiRequest<Event[]>('/api/events'),
    get: (id: number) => apiRequest<Event>(`/api/events/${id}`),
    create: (data: EventCreate) => apiRequest<Event>('/api/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: number, data: EventUpdate) => apiRequest<Event>(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: number) => apiRequest<void>(`/api/events/${id}`, {
      method: 'DELETE',
    }),
  },
  
  auth: {
    status: () => apiRequest<AuthStatus>('/api/auth/status'),
    setup: (pin: string) => apiRequest<{ message: string }>('/api/auth/setup', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    }),
    verify: (pin: string) => apiRequest<{ access_token: string }>('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    }),
    change: (oldPin: string, newPin: string) => apiRequest<{ message: string }>('/api/auth/change', {
      method: 'POST',
      body: JSON.stringify({ old_pin: oldPin, new_pin: newPin }),
    }),
  },
  
  settings: {
    get: () => apiRequest<Settings>('/api/settings'),
    update: (data: Partial<Settings>) => apiRequest<Settings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  },
};

// Auth utilities
export const setToken = (token: string) => {
  localStorage.setItem('timetable_token', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('timetable_token');
};

export const clearToken = () => {
  localStorage.removeItem('timetable_token');
};

export const getAuthStatus = async () => {
  return api.auth.status();
};
