import { Transaction } from '@/types';

const KEY = 'pg_transactions';

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Transaction[]) : [];
  } catch {
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(transactions));
  } catch {
    console.error('Failed to save transactions to localStorage.');
  }
}