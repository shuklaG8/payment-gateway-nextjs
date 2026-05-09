'use client';

import { useState, useId } from 'react';
import { PaymentFormValues, FormErrors, CardType, Currency } from '@/types';

import {
  detectCardType,
  formatCardNumber,
  getCvvMaxLength,
} from '@/utils/cardUtils';

import {
  validateCardholderName,
  validateCardNumber,
  validateExpiry,
  validateCvv,
  validateAmount,
} from '@/utils/validators';

import CardPreview from './CardPreview';

interface Props {
  onSubmit: (
    values: PaymentFormValues,
    transactionId: string
  ) => void;

  onRetry: (values: PaymentFormValues) => void;

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
  onSubmit,
  onRetry,
  isProcessing,
  retryCount,
  canRetry,
  MAX_RETRIES,
  currentTransactionId,
}: Props) {
  const id = useId();

  const [values, setValues] =
    useState<PaymentFormValues>(INITIAL);

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [touched, setTouched] =
    useState<
      Partial<Record<keyof PaymentFormValues, boolean>>
    >({});

  const [cardType, setCardType] =
    useState<CardType>('unknown');

  const [txnId] = useState<string>(() =>
    crypto.randomUUID()
  );

  const activeTxnId =
    currentTransactionId ?? txnId;

  function validate(
    vals: PaymentFormValues
  ): FormErrors {
    return {
      cardholderName:
        validateCardholderName(
          vals.cardholderName
        ),

      cardNumber:
        validateCardNumber(
          vals.cardNumber,
          cardType
        ),

      expiry: validateExpiry(vals.expiry),

      cvv: validateCvv(
        vals.cvv,
        cardType
      ),

      amount: validateAmount(vals.amount),
    };
  }

  function isFormValid(errs: FormErrors) {
    return Object.values(errs).every(v => !v);
  }

  function handleChange(
    field: keyof PaymentFormValues,
    raw: string
  ) {
    let val: string | number = raw;

    if (field === 'cardNumber') {
      const detected =
        detectCardType(raw);

      setCardType(detected);

      val = formatCardNumber(
        raw,
        detected
      );
    }

    if (field === 'expiry') {
      val = raw
        .replace(/\D/g, '')
        .slice(0, 4);

      if (
        typeof val === 'string' &&
        val.length >= 3
      ) {
        val =
          val.slice(0, 2) +
          '/' +
          val.slice(2);
      }
    }

    if (field === 'cvv') {
      val = raw
        .replace(/\D/g, '')
        .slice(
          0,
          getCvvMaxLength(cardType)
        );
    }

    if (field === 'amount') {
      const cleaned =
        raw.replace(/[^0-9.]/g, '');

      val =
        cleaned === ''
          ? 0
          : Number(cleaned);
    }

    const next = {
      ...values,
      [field]: val,
    } as PaymentFormValues;

    setValues(next);

    if (touched[field]) {
      const errs = validate(next);

      setErrors(prev => ({
        ...prev,
        [field]:
          errs[field as keyof FormErrors],
      }));
    }
  }

  function handleBlur(
    field: keyof PaymentFormValues
  ) {
    setTouched(prev => ({
      ...prev,
      [field]: true,
    }));

    const errs = validate(values);

    setErrors(prev => ({
      ...prev,
      [field]:
        errs[field as keyof FormErrors],
    }));
  }

  function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const allTouched =
      Object.fromEntries(
        Object.keys(values).map(k => [
          k,
          true,
        ])
      ) as Partial<
        Record<
          keyof PaymentFormValues,
          boolean
        >
      >;

    setTouched(allTouched);

    const errs = validate(values);

    setErrors(errs);

    if (!isFormValid(errs)) return;

    if (retryCount === 0) {
      onSubmit(values, activeTxnId);
    } else {
      onRetry(values);
    }
  }

  const currentErrors = validate(values);

  const formValid =
    isFormValid(currentErrors);

  const inputClass = (
    field: keyof FormErrors
  ) =>
    `w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      touched[field] && errors[field]
        ? 'border-red-500 bg-red-50'
        : 'border-gray-300 bg-white'
    }`;

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <CardPreview
        cardholderName={
          values.cardholderName
        }
        cardNumber={values.cardNumber}
        expiry={values.expiry}
        cardType={cardType}
        currency={values.currency}
      />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4 bg-white rounded-2xl p-6 shadow-md"
      >
        <div>
          <label
            htmlFor={`${id}-amount`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Amount
          </label>

          <div className="flex gap-2">
            <select
              value={values.currency}
              onChange={e =>
                setValues(prev => ({
                  ...prev,
                  currency:
                    e.target
                      .value as Currency,
                }))
              }
              className="px-2 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="INR">
                INR ₹
              </option>

              <option value="USD">
                USD $
              </option>
            </select>

            <input
              id={`${id}-amount`}
              type="number"
              inputMode="decimal"
              value={values.amount}
              onChange={e =>
                handleChange(
                  'amount',
                  e.target.value
                )
              }
              onBlur={() =>
                handleBlur('amount')
              }
              className={`flex-1 ${inputClass(
                'amount'
              )}`}
              placeholder="0.00"
            />
          </div>

          {touched.amount &&
            errors.amount && (
              <p className="mt-1 text-xs text-red-600">
                {errors.amount}
              </p>
            )}
        </div>

        <button
          type="submit"
          disabled={
            !formValid ||
            isProcessing ||
            (!canRetry &&
              retryCount > 0)
          }
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm"
        >
          {isProcessing
            ? 'Processing...'
            : 'Pay Now'}
        </button>
      </form>
    </div>
  );
}