import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRoiByAmount(amount: number): number {
  if (amount >= 10 && amount < 50000) return 0.025;
  if (amount >= 50000 && amount < 1000000) return 0.027;
  if (amount >= 1000000 && amount <= 10000000) return 0.029;
  return 0.025; // fallback
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return countryCode;
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
