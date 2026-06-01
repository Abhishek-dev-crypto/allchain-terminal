import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely
 * - Handles conditional classes (clsx)
 * - Resolves Tailwind conflicts (twMerge)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}