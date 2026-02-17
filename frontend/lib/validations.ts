import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    telegramUsername: z.string().min(2, "Telegram username must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Event/Person schemas
export const eventSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  eventDate: z.date({ message: "Event date is required" }),
  eventLabel: z.string().max(50, "Event label is too long").optional(),
  notes: z.string().max(500, "Notes are too long").optional(),
  isRecurring: z.boolean().default(true),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type EventFormData = z.infer<typeof eventSchema>;
