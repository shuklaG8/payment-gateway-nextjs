'use client';

import { useId } from 'react';
import { CardType } from '@/types';
import { formatCardNumber, detectCardType, getCvvMaxLength } from '@/utils/cardUtils';
import { validateCardNumber, validateCvv, validateExpiry } from '@/utils/validators';

function VisaBadge() {
  return (
    <svg viewBox="0 0 50 16" className="h-5 w-auto" aria-label="Visa">
      <text x="0" y="13" fontSize="14" fontWeight="bold" fill="#1A1F71" fontFamily="Arial">
        VISA
      </text>
    </svg>
  );
}

function MastercardBadge() {
  return (
    <svg viewBox="0 0 38 24" className="h-5 w-auto" aria-label="Mastercard">
      <circle cx="15" cy="12" r="10" fill="#EB001B" />
      <circle cx="23" cy="12" r="10" fill="#F79E1B" />
      <path
        d="M19 5.27a10 10 0 0 1 0 13.46A10 10 0 0 1 19 5.27z"
        fill="#FF5F00"
      />
    </svg>
  );
}

function AmexBadge() {
  return (
    <svg viewBox="0 0 50 16" className="h-5 w-auto" aria-label="American Express">
      <rect width="50" height="16" rx="3" fill="#2557D6" />
      <text x="4" y="12" fontSize="9" fontWeight="bold" fill="white" fontFamily="Arial">
        AMEX
      </text>
    </svg>
  );
}

const CARD_BADGE: Record<CardType, React.ReactNode> = {
  visa: <VisaBadge />,
  mastercard: <MastercardBadge />,
  amex: <AmexBadge />,
  unknown: null,
};

interface CardNumberProps {
  value: string;
  cardType: CardType;
  error?: string;
  touched: boolean;
  onChange: (raw: string, detected: CardType) => void;
  onBlur: () => void;
}

export function CardNumberInput({ value, cardType, error, touched, onChange, onBlur }: CardNumberProps) {
  const id = useId();
  const errId = `${id}-err`;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const detected = detectCardType(raw);
    const formatted = formatCardNumber(raw, detected);
    onChange(formatted, detected);
  }

  const maxLen = cardType === 'amex' ? 17 : 19;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        Card Number
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="cc-number"
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          maxLength={maxLen}
          placeholder="4242 4242 4242 4242"
          aria-describedby={touched && error ? errId : undefined}
          aria-invalid={touched && !!error}
          className={`w-full px-3 py-2 pr-16 rounded-lg border text-sm font-mono
            focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
            ${touched && error
              ? 'border-red-500 bg-red-50 text-red-900'
              : 'border-gray-300 bg-white text-gray-900'
            }`}
        />
        {cardType !== 'unknown' && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {CARD_BADGE[cardType]}
          </span>
        )}
      </div>
      {touched && error && (
        <p id={errId} role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

interface ExpiryProps {
  value: string;
  error?: string;
  touched: boolean;
  onChange: (val: string) => void;
  onBlur: () => void;
}

export function ExpiryInput({ value, error, touched, onChange, onBlur }: ExpiryProps) {
  const id = useId();
  const errId = `${id}-err`;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) raw = raw.slice(0, 2) + '/' + raw.slice(2);
    onChange(raw);
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        Expiry (MM/YY)
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="cc-exp"
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        maxLength={5}
        placeholder="08/28"
        aria-describedby={touched && error ? errId : undefined}
        aria-invalid={touched && !!error}
        className={`w-full px-3 py-2 rounded-lg border text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
          ${touched && error
            ? 'border-red-500 bg-red-50 text-red-900'
            : 'border-gray-300 bg-white text-gray-900'
          }`}
      />
      {touched && error && (
        <p id={errId} role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

interface CvvProps {
  value: string;
  cardType: CardType;
  error?: string;
  touched: boolean;
  onChange: (val: string) => void;
  onBlur: () => void;
}

export function CvvInput({ value, cardType, error, touched, onChange, onBlur }: CvvProps) {
  const id = useId();
  const errId = `${id}-err`;
  const maxLen = getCvvMaxLength(cardType);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, maxLen);
    onChange(raw);
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        CVV
        <span className="ml-1 text-xs text-gray-400 font-normal">
          ({maxLen} digits{cardType === 'amex' ? ' — Amex' : ''})
        </span>
      </label>
      <div className="relative">
        <input
          id={id}
          type="password"
          inputMode="numeric"
          autoComplete="cc-csc"
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          maxLength={maxLen}
          placeholder={cardType === 'amex' ? '••••' : '•••'}
          aria-describedby={touched && error ? errId : undefined}
          aria-invalid={touched && !!error}
          className={`w-full px-3 py-2 rounded-lg border text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
            ${touched && error
              ? 'border-red-500 bg-red-50 text-red-900'
              : 'border-gray-300 bg-white text-gray-900'
            }`}
        />
        {/* Lock icon */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </span>
      </div>
      {touched && error && (
        <p id={errId} role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

interface CardInputGroupProps {
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardType: CardType;
  errors: { cardNumber?: string; expiry?: string; cvv?: string };
  touched: { cardNumber?: boolean; expiry?: boolean; cvv?: boolean };
  onCardNumberChange: (val: string, type: CardType) => void;
  onExpiryChange: (val: string) => void;
  onCvvChange: (val: string) => void;
  onBlur: (field: 'cardNumber' | 'expiry' | 'cvv') => void;
}

export default function CardInput({
  cardNumber, expiry, cvv, cardType,
  errors, touched,
  onCardNumberChange, onExpiryChange, onCvvChange, onBlur,
}: CardInputGroupProps) {
  return (
    <div className="space-y-4">
      <CardNumberInput
        value={cardNumber}
        cardType={cardType}
        error={errors.cardNumber}
        touched={!!touched.cardNumber}
        onChange={onCardNumberChange}
        onBlur={() => onBlur('cardNumber')}
      />

      <div className="flex gap-3">
        <div className="flex-1">
          <ExpiryInput
            value={expiry}
            error={errors.expiry}
            touched={!!touched.expiry}
            onChange={onExpiryChange}
            onBlur={() => onBlur('expiry')}
          />
        </div>
        <div className="flex-1">
          <CvvInput
            value={cvv}
            cardType={cardType}
            error={errors.cvv}
            touched={!!touched.cvv}
            onChange={onCvvChange}
            onBlur={() => onBlur('cvv')}
          />
        </div>
      </div>
    </div>
  );
}