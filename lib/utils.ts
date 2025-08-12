import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// removed demo mock data

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
