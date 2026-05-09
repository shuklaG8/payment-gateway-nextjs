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
        <div className="w-14 h-14 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin shadow-lg shadow-blue-500/20" />
        <p className="text-slate-700 font-semibold text-lg animate-pulse">Processing your payment…</p>
        <p className="text-xs text-slate-400">Please do not close this window.</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center shadow-lg shadow-green-500/20 mb-2 transform transition-all duration-500 hover:scale-110">
          <svg className="w-10 h-10 text-green-600 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-extrabold text-green-700 outline-none drop-shadow-sm">
          Payment Successful!
        </h2>
        <p className="text-slate-500 text-sm">Your transaction has been completed.</p>
        <button
          onClick={onReset}
          className="mt-6 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
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
            Attempt {retryCount + 1} of {MAX_RETRIES + 1} — {MAX_RETRIES - retryCount} retries remaining
          </p>
        )}

        <div className="flex gap-4 mt-6 flex-wrap justify-center">
          {!exhausted ? (
            <button
              onClick={onRetry}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
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
            className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return null;
}