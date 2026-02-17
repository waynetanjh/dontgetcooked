export interface User {
  id: string;
  email: string;
  name: string;
  telegramUsername?: string;
}

export interface Event {
  id: string;
  name: string;
  eventDate: string; // ISO date string
  eventLabel?: string;
  notes?: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpcomingEvent extends Event {
  daysUntil: number;
  yearCount: number;
  nextOccurrence: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      telegramUsername?: string;
    };
  };
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  telegramUsername: string;
  email: string;
  password: string;
  confirmPassword: string;
}
