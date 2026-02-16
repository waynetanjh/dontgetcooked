import axios from "axios";
import { getSession } from "next-auth/react";
import type { Person, UpcomingEvent, AuthResponse, LoginCredentials, RegisterCredentials } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on unauthorized
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
  },

  register: async (data: RegisterCredentials): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/auth/register`, {
      name: data.name,
      email: data.email,
      password: data.password,
    });
    return response.data;
  },
};

// People/Events API
export const peopleApi = {
  getAll: async (): Promise<Person[]> => {
    const response = await api.get("/friends");
    return response.data.data; // Access nested data property
  },

  getById: async (id: string): Promise<Person> => {
    const response = await api.get(`/friends/${id}`);
    return response.data.data; // Access nested data property
  },

  create: async (data: Omit<Person, "id" | "createdAt" | "updatedAt">): Promise<Person> => {
    const response = await api.post("/friends", data);
    return response.data.data; // Access nested data property
  },

  update: async (id: string, data: Partial<Omit<Person, "id" | "createdAt" | "updatedAt">>): Promise<Person> => {
    const response = await api.put(`/friends/${id}`, data);
    return response.data.data; // Access nested data property
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/friends/${id}`);
  },
};

// Events/Birthdays API
export const eventsApi = {
  getUpcoming: async (): Promise<UpcomingEvent[]> => {
    const response = await api.get("/birthdays/upcoming");
    return response.data.data; // Access nested data property
  },

  exportCalendar: async (): Promise<Blob> => {
    const response = await api.get("/birthdays/calendar/export", {
      responseType: "blob",
    });
    return response.data;
  },
};

// Telegram API
export const telegramApi = {
  sendTest: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post("/telegram/test");
    return { success: response.data.success, message: response.data.message };
  },
};

export default api;
