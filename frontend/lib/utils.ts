import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInDays, addYears, isSameDay, isToday, isTomorrow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate the next occurrence of an annual event
 */
export function getNextOccurrence(eventDate: Date): Date {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Set the event to this year
  let nextDate = new Date(eventDate);
  nextDate.setFullYear(currentYear);
  
  // If the date has passed this year, move to next year
  if (nextDate < now && !isSameDay(nextDate, now)) {
    nextDate = addYears(nextDate, 1);
  }
  
  return nextDate;
}

/**
 * Calculate how many days until the next occurrence
 */
export function getDaysUntil(eventDate: Date): number {
  const nextOccurrence = getNextOccurrence(eventDate);
  const now = new Date();
  
  // If it's today, return 0
  if (isSameDay(nextOccurrence, now)) {
    return 0;
  }
  
  return differenceInDays(nextOccurrence, now);
}

/**
 * Get countdown text (Today!, Tomorrow, In X days)
 */
export function getCountdownText(eventDate: Date): string {
  const nextOccurrence = getNextOccurrence(eventDate);
  
  if (isToday(nextOccurrence)) {
    return "Today!";
  }
  
  if (isTomorrow(nextOccurrence)) {
    return "Tomorrow";
  }
  
  const days = getDaysUntil(eventDate);
  return `In ${days} day${days === 1 ? "" : "s"}`;
}

/**
 * Calculate how many years since the original event
 */
export function getYearCount(eventDate: Date): number {
  const now = new Date();
  const original = new Date(eventDate);
  let years = now.getFullYear() - original.getFullYear();
  
  // Adjust if we haven't reached the date this year yet
  const nextOccurrence = getNextOccurrence(eventDate);
  if (nextOccurrence > now) {
    years -= 1;
  }
  
  return years;
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMMM d, yyyy");
}

/**
 * Format date for input field (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "yyyy-MM-dd");
}

/**
 * Get ordinal suffix for year count (1st, 2nd, 3rd, etc.)
 */
export function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) {
    return num + "st";
  }
  if (j === 2 && k !== 12) {
    return num + "nd";
  }
  if (j === 3 && k !== 13) {
    return num + "rd";
  }
  return num + "th";
}
