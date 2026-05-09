'use client';

import { useState } from 'react';
import { PaymentFormValues, FormErrors, CardType, Currency } from '@/types';
import { validateCardholderName, validateCardNumber, validateExpiry, validateCvv, validateAmount } from '@/utils/validators';
import CardPreview from './CardPreview';
import CardInput from './CardInput';

interface Props {
  onSubmit: (values: PaymentFormValues, transactionId: string) => void;
  isProcessing: boolean;
  retryCount: number;
  canRetry: boolean;
  MAX_RETRIES: number;
  currentTransactionId: string | null;
}

const INITIAL: PaymentFormValues = {
  cardholderName: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
  amount: 0,
  currency: 'INR',
};

export default function PaymentForm({
  onSubmit, isProcessing, retryCount, canRetry, MAX_RETRIES, currentTransactionId,
}: Props) {
  const [values, setValues] = useState<PaymentFormValues>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof PaymentFormValues, boolean>>>({});
  const [cardType, setCardType] = useState<CardType>('unknown');
  const [txnId] = useState<string>(() => crypto.randomUUID());
  const activeTxnId = currentTransactionId ?? txnId;

  // ── Validation ───────────────────────────────────────────────
  function validate(vals: PaymentFormValues): FormErrors {
    return {
      cardholderName: validateCardholderName(vals.cardholderName),
      cardNumber: validateCardNumber(vals.cardNumber, cardType),
      expiry: validateExpiry(vals.expiry),
      cvv: validateCvv(vals.cvv, cardType),
      amount: validateAmount(vals.amount),
    };
  }

  function isFormValid(errs: FormErrors) {
    return Object.values(errs).every(v => !v);
  }

  function handleFieldChange(field: keyof PaymentFormValues, val: string) {
    const next = { ...values, [field]: val };
    setValues(next);
    if (touched[field]) {
      const errs = validate(next);
      setErrors(prev => ({ ...prev, [field]: errs[field as keyof FormErrors] }));
    }
  }

  function handleBlur(field: keyof PaymentFormValues) {
    setTouched(prev => ({ ...prev, [field]: true }));
    const errs = validate(values);
    setErrors(prev => ({ ...prev, [field]: errs[field as keyof FormErrors] }));
  }

  function handleCardNumberChange(formatted: string, detected: CardType) {
    setCardType(detected);
    const next = { ...values, cardNumber: formatted };
    setValues(next);
    if (touched.cardNumber) {
      const errs = validate(next);
      setErrors(prev => ({ ...prev, cardNumber: errs.cardNumber }));
    }
  }

  function handleExpiryChange(val: string) {
    handleFieldChange('expiry', val);
  }

  function handleCvvChange(val: string) {
    handleFieldChange('cvv', val);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allTouched = Object.fromEntries(
      Object.keys(values).map(k => [k, true])
    ) as Partial<Record<keyof PaymentFormValues, boolean>>;
    setTouched(allTouched);
    const errs = validate(values);
    setErrors(errs);
    if (!isFormValid(errs)) return;
    onSubmit(values, activeTxnId);
  }

  const formValid = isFormValid(validate(values));
  const buttonDisabled = !formValid || isProcessing || (!canRetry && retryCount > 0);

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <CardPreview
        cardholderName={values.cardholderName}
        cardNumber={values.cardNumber}
        expiry={values.expiry}
        cardType={cardType}
        currency={values.currency}
      />

      <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl p-6 shadow-md space-y-4">

        <div>
          <label htmlFor="cardholder-name" className="block text-sm font-medium text-gray-700 mb-1">
            Cardholder Name
          </label>
          <input
            id="cardholder-name"
            type="text"
            autoComplete="cc-name"
            value={values.cardholderName}
            onChange={e => handleFieldChange('cardholderName', e.target.value)}
            onBlur={() => handleBlur('cardholderName')}
            aria-describedby={touched.cardholderName && errors.cardholderName ? 'name-err' : undefined}
            aria-invalid={touched.cardholderName && !!errors.cardholderName}
            placeholder="John Doe"
            className={`w-full px-3 py-2 rounded-lg border text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
              ${touched.cardholderName && errors.cardholderName
                ? 'border-red-500 bg-red-50 text-red-900'
                : 'border-gray-300 bg-white text-gray-900'
              }`}
          />
          {touched.cardholderName && errors.cardholderName && (
            <p id="name-err" role="alert" className="mt-1 text-xs text-red-600">
              {errors.cardholderName}
            </p>
          )}
        </div>

        <CardInput
          cardNumber={values.cardNumber}
          expiry={values.expiry}
          cvv={values.cvv}
          cardType={cardType}
          errors={{
            cardNumber: errors.cardNumber,
            expiry: errors.expiry,
            cvv: errors.cvv,
          }}
          touched={{
            cardNumber: touched.cardNumber,
            expiry: touched.expiry,
            cvv: touched.cvv,
          }}
          onCardNumberChange={handleCardNumberChange}
          onExpiryChange={handleExpiryChange}
          onCvvChange={handleCvvChange}
          onBlur={field => handleBlur(field)}
        />

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <div className="flex gap-2">
            <select
              value={values.currency}
              onChange={e => setValues(prev => ({ ...prev, currency: e.target.value as Currency }))}
              aria-label="Currency"
              className="px-2 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="INR">INR ₹</option>
              <option value="USD">USD $</option>
            </select>
            <input
              id="amount"
              type="text"
              inputMode="decimal"
              value={values.amount}
              onChange={e => handleFieldChange('amount', e.target.value.replace(/[^0-9.]/g, ''))}
              onBlur={() => handleBlur('amount')}
              aria-describedby={touched.amount && errors.amount ? 'amount-err' : undefined}
              aria-invalid={touched.amount && !!errors.amount}
              placeholder="0.00"
              className={`flex-1 px-3 py-2 rounded-lg border text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
                ${touched.amount && errors.amount
                  ? 'border-red-500 bg-red-50 text-red-900'
                  : 'border-gray-300 bg-white text-gray-900'
                }`}
            />
          </div>
          {touched.amount && errors.amount && (
            <p id="amount-err" role="alert" className="mt-1 text-xs text-red-600">
              {errors.amount}
            </p>
          )}
        </div>

        {retryCount > 0 && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2" role="status">
            Attempt {retryCount + 1} of {MAX_RETRIES + 1}
          </p>
        )}

        <button
          type="submit"
          disabled={buttonDisabled}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm
            hover:bg-blue-700 active:bg-blue-800 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing
            ? 'Processing…'
            : retryCount > 0
            ? `Retry Payment (${retryCount}/${MAX_RETRIES})`
            : 'Pay Now'}
        </button>
      </form>
    </div>
  );
}