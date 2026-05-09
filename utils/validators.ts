import { CardType } from '@/types';
import { getCardMaxLength, getCvvMaxLength } from './cardUtils';

export function validateCardholderName(value: string): string | undefined {
  if (!value.trim()) return 'Cardholder name is required.';
  if (value.trim().length < 2) return 'Name must be at least 2 characters.';
  if (!/^[a-zA-Z\s'-]+$/.test(value)) return 'Name must contain only letters.';
}

export function validateCardNumber(value: string, cardType: CardType): string | undefined {
  const raw = value.replace(/\s/g, '');
  if (!raw) return 'Card number is required.';
  if (!/^\d+$/.test(raw)) return 'Card number must contain only digits.';
  const maxLen = getCardMaxLength(cardType);
  if (raw.length !== maxLen) return `Card number must be ${maxLen} digits.`;
  if (!luhnCheck(raw)) return 'Invalid card number.';
}

export function validateExpiry(value: string): string | undefined {
  if (!value) return 'Expiry date is required.';
  if (!/^\d{2}\/\d{2}$/.test(value)) return 'Use MM/YY format.';
  const [mm, yy] = value.split('/').map(Number);
  if (mm < 1 || mm > 12) return 'Invalid month.';
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  if (yy < currentYear || (yy === currentYear && mm < currentMonth)) {
    return 'Card has expired.';
  }
}

export function validateCvv(value: string, cardType: CardType): string | undefined {
  if (!value) return 'CVV is required.';
  const maxLen = getCvvMaxLength(cardType);
  if (!/^\d+$/.test(value)) return 'CVV must contain only digits.';
  if (value.length !== maxLen) return `CVV must be ${maxLen} digits.`;
}

export function validateAmount(value: string): string | undefined {
  if (!value) return 'Amount is required.';
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) return 'Enter a valid amount greater than 0.';
  if (num > 1_000_000) return 'Amount cannot exceed 1,000,000.';
}

function luhnCheck(num: string): boolean {
  let sum = 0;
  let alternate = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}