import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// removed demo mock data

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Standard currency formatter for consistent money display
export function formatCurrency(
  value: number | null | undefined,
  locale: string = 'es-ES',
  currency: string = 'EUR'
): string {
  const amount = typeof value === 'number' && isFinite(value) ? value : 0
  return amount.toLocaleString(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  })
}
