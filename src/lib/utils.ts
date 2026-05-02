import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';
import { StockStatus } from '../types';

/**
 * Utility for merging tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate days until expiry date (negative if expired)
 */
export function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if a medicine batch is already expired
 */
export function isExpired(expiryDate: string): boolean {
  return getDaysUntilExpiry(expiryDate) < 0;
}

/**
 * Check if a medicine batch is within warning threshold (days before expiry)
 */
export function isExpiryWarning(expiryDate: string, days: number = 14): boolean {
  const daysUntil = getDaysUntilExpiry(expiryDate);
  return daysUntil >= 0 && daysUntil <= days;
}

/**
 * Format expiry date for display (e.g., "May 15, 2025")
 */
export function formatExpiryDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get expiry status category for a single batch
 */
export function getExpiryStatus(expiryDate: string): 'EXPIRED' | 'EXPIRING' | 'OK' {
  if (isExpired(expiryDate)) return 'EXPIRED';
  if (isExpiryWarning(expiryDate, 14)) return 'EXPIRING';
  return 'OK';
}
