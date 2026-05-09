// components/TransactionHistory.tsx
'use client';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { selectTransaction } from '@/store/paymentSlice';
import { Transaction, PaymentStatus } from '@/types';

const STATUS_STYLES: Record<PaymentStatus, string> = {
  success: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  timeout: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  idle: 'bg-gray-100 text-gray-600',
};

const CURRENCY_SYMBOL: Record<string, string> = { INR: '₹', USD: '$' };

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function TransactionHistory() {
  const dispatch = useDispatch<AppDispatch>();
  const { history, selectedTransaction } = useSelector((s: RootState) => s.payment);

  if (history.length === 0) {
    return (
      <div className="text-center text-gray-400 text-sm py-8">
        No transactions yet.
      </div>
    );
  }

  if (selectedTransaction) {
    const t = selectedTransaction;
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
        <button
          onClick={() => dispatch(selectTransaction(null))}
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          ← Back to history
        </button>
        <h3 className="text-lg font-bold text-gray-800">Transaction Detail</h3>
        <dl className="space-y-2 text-sm">
          <Row label="Transaction ID" value={t.id} mono />
          <Row label="Status">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[t.status]}`}>
              {t.status.toUpperCase()}
            </span>
          </Row>
          <Row label="Amount" value={`${CURRENCY_SYMBOL[t.currency]}${t.amount.toFixed(2)} ${t.currency}`} />
          <Row label="Cardholder" value={t.cardholderName} />
          <Row label="Card" value={`•••• •••• •••• ${t.cardNumberLast4}`} mono />
          <Row label="Attempts" value={String(t.attempts)} />
          <Row label="Timestamp" value={formatDate(t.timestamp)} />
          {t.failureReason && <Row label="Reason" value={t.failureReason} />}
        </dl>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <h3 className="text-sm font-bold text-gray-700 px-4 py-3 border-b">
        Transaction History
      </h3>
      <ul className="divide-y divide-gray-100">
        {history.map(t => (
          <li key={t.id}>
            <button
              onClick={() => dispatch(selectTransaction(t))}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <p className="text-xs text-gray-400 font-mono">{t.id.slice(0, 8)}…</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {CURRENCY_SYMBOL[t.currency]}{t.amount.toFixed(2)} {t.currency}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(t.timestamp)}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[t.status]}`}>
                  {t.status.toUpperCase()}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  children,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500 shrink-0">{label}</dt>
      <dd className={`text-gray-800 text-right break-all ${mono ? 'font-mono text-xs' : ''}`}>
        {children ?? value}
      </dd>
    </div>
  );
}