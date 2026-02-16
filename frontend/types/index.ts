export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Person {
  id: string;
  name: string;
  eventDate: string; // ISO date string
  eventLabel?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpcomingEvent extends Person {
  daysUntil: number;
  yearCount: number;
  nextOccurrence: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
