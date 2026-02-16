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
  token: string;
  user: User;
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
