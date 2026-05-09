'use client';
import { useEffect, useRef } from 'react';
import { PaymentStatus } from '@/types';

interface Props {
  status: PaymentStatus;
  failureReason: string | null;
  retryCount: number;
  canRetry: boolean;
  MAX_RETRIES: number;
  onRetry: () => void;
  onReset: () => void;
}

export default function StatusScreen({
  status, failureReason, retryCount, canRetry, MAX_RETRIES, onRetry, onReset,
}: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (status !== 'idle' && status !== 'processing') {
      headingRef.current?.focus();
    }
  }, [status]);

  if (status === 'idle') return null;

  if (status === 'processing') {
    return (
      <div className="flex flex-col items-center gap-4 py-10" role="status" aria-live="polite">
        <div className="w-14 h-14 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
        <p className="text-gray-600 font-medium">Processing your payment…</p>
        <p className="text-xs text-gray-400">Please do not close this window.</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-green-700 outline-none">
          Payment Successful!
        </h2>
        <p className="text-gray-500 text-sm">Your transaction has been completed.</p>
        <button
          onClick={onReset}
          className="mt-2 px-6 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
        >
          Make Another Payment
        </button>
      </div>
    );
  }

  if (status === 'failed' || status === 'timeout') {
    const isTimeout = status === 'timeout';
    const exhausted = !canRetry;

    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          {isTimeout ? (
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-red-700 outline-none">
          {isTimeout ? 'Payment Timed Out' : 'Payment Failed'}
        </h2>

        <p className="text-gray-500 text-sm max-w-xs">
          {failureReason ?? (isTimeout
            ? 'The request took too long. Please try again.'
            : 'Something went wrong with your payment.')}
        </p>

        {!exhausted && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
            Attempt {retryCount} of {MAX_RETRIES} — {MAX_RETRIES - retryCount} retries remaining
          </p>
        )}

        <div className="flex gap-3 mt-2 flex-wrap justify-center">
          {!exhausted ? (
            <button
              onClick={onRetry}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Retry Payment
            </button>
          ) : (
            <p className="text-sm text-red-600 font-medium">
              Maximum retry attempts reached. Please start a new transaction.
            </p>
          )}
          <button
            onClick={onReset}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return null;
}