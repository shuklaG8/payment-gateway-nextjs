'use client';

import { useEffect, useRef, useState } from 'react';
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
  const [txnId, setTxnId] = useState<string>(() => crypto.randomUUID());

  useEffect(() => {
    dispatch(initHistory());
  }, [dispatch]);

  function handleSubmit(values: PaymentFormValues, transactionId: string) {
    savedValues.current = values;
    setTxnId(transactionId);
    submitPayment(values, transactionId);
  }

  function handleRetry(values: PaymentFormValues) {
    savedValues.current = values;
    submitPayment(values, txnId);
  }

  function handleReset() {
    savedValues.current = null;
    setTxnId(crypto.randomUUID());
    reset();
  }

  const isProcessing = status === 'processing';
  const showStatus = status !== 'idle';
  const showForm = status === 'idle' || status === 'failed' || status === 'timeout';

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Payment Gateway</h1>
          <p className="text-gray-500 text-sm mt-1">Secure simulated payment flow</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          <div className="space-y-6">

            {showStatus && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <StatusScreen
                  status={status}
                  failureReason={failureReason}
                  retryCount={retryCount}
                  canRetry={canRetry}
                  MAX_RETRIES={MAX_RETRIES}
                  onRetry={() => savedValues.current && handleRetry(savedValues.current)}
                  onReset={handleReset}
                />
              </div>
            )}

            {showForm && (
              <PaymentForm
                onSubmit={handleSubmit}
                onRetry={handleRetry}
                isProcessing={isProcessing}
                retryCount={retryCount}
                canRetry={canRetry}
                MAX_RETRIES={MAX_RETRIES}
                currentTransactionId={currentTransactionId}
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