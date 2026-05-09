'use client';

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { initHistory } from '@/store/paymentSlice';
import { usePayment } from '@/hooks/usePayment';
import { PaymentFormValues } from '@/types';
import PaymentForm from '@/components/PaymentForm';
import StatusScreen from '@/components/StatusScreen';
import TransactionHistory from '@/components/TransactionHistory';

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { status, failureReason } = useSelector((s: RootState) => s.payment);
  const {
    submitPayment,
    reset,
    retryCount,
    canRetry,
    MAX_RETRIES,
    currentTransactionId,
  } = usePayment();

  const savedValues = useRef<PaymentFormValues | null>(null);

  useEffect(() => {
    dispatch(initHistory());
  }, [dispatch]);

  function handleSubmit(values: PaymentFormValues) {
    savedValues.current = values;
    // Generate a new transaction ID only for the first attempt
    const newTxnId = crypto.randomUUID();
    submitPayment(values, newTxnId);
  }

  function handleRetry() {
    if (savedValues.current && currentTransactionId) {
      submitPayment(savedValues.current, currentTransactionId);
    }
  }

  function handleReset() {
    savedValues.current = null;
    reset();
  }

  const isProcessing = status === 'processing';
  const showStatus = status !== 'idle';
  const showForm = status === 'idle' || status === 'failed' || status === 'timeout';

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-200 py-12 px-4 text-slate-800 font-sans selection:bg-blue-200">
      <div className="max-w-5xl mx-auto">

        <div className="mb-10 text-center space-y-2 transform transition-all duration-700 translate-y-0 opacity-100">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">Payment Gateway</h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Secure simulated payment flow</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          <div className="space-y-6">

            {showStatus && (
              <div className="w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-8 transform transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                <StatusScreen
                  status={status}
                  failureReason={failureReason}
                  retryCount={retryCount}
                  canRetry={canRetry}
                  MAX_RETRIES={MAX_RETRIES}
                  onRetry={handleRetry}
                  onReset={handleReset}
                />
              </div>
            )}

            {showForm && (
              <PaymentForm
                onSubmit={handleSubmit}
                isProcessing={isProcessing}
                retryCount={retryCount}
                canRetry={canRetry}
                MAX_RETRIES={MAX_RETRIES}
              />
            )}
          </div>

          <div>
            <TransactionHistory />
          </div>

        </div>
      </div>
    </main>
  );
}