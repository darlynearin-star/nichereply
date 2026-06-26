import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhone(waId: string): string {
  if (waId.startsWith('256')) return `+256 ${waId.slice(3, 6)} ${waId.slice(6, 9)} ${waId.slice(9)}`;
  if (waId.startsWith('1')) return `+1 ${waId.slice(1, 4)} ${waId.slice(4, 7)} ${waId.slice(7)}`;
  return `+${waId}`;
}

export function truncate(str: string, len = 80): string {
  return str.length > len ? str.slice(0, len) + '...' : str;
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diff = Math.floor((now.getTime() - past.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return past.toLocaleDateString();
}

export function randomId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 11);
}
