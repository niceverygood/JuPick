import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + '원'
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\. /g, '.').replace(/\.$/, '')
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getDaysRemaining(endDate: Date | string): number {
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function calculateDaysBetween(startDate: Date, endDate: Date): number {
  const diff = endDate.getTime() - startDate.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1
}

export function getSubscriptionStatus(endDate: Date | string): 'active' | 'expiring' | 'expired' {
  const daysRemaining = getDaysRemaining(endDate)
  if (daysRemaining <= 0) return 'expired'
  if (daysRemaining <= 7) return 'expiring'
  return 'active'
}


