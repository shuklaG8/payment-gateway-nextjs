import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    startPayment,
    retryPayment,
    paymentSuccess,
    paymentFailed,
    paymentTimeout,
    resetPayment,
} from '@/store/paymentSlice';
import { PaymentFormValues, Transaction } from '@/types';
import { GatewayResponse } from '@/types';
import { AppDispatch, RootState } from '@/store/store';

const MAX_RETRIES = 2;
const TIMEOUT_MS = 6000;

export function usePayment() {
    const dispatch = useDispatch<AppDispatch>();
    const { status, currentTransactionId, retryCount } = useSelector(
        (s: RootState) => s.payment
    );
    const abortRef = useRef<AbortController | null>(null);

    async function submitPayment(values: PaymentFormValues, transactionId: string) {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const isFirstAttempt = retryCount === 0;
        if (isFirstAttempt) {
            dispatch(startPayment(transactionId));
        } else {
            dispatch(retryPayment());
        }

        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const parsedAmount = typeof values.amount === 'string' ? parseFloat(values.amount) : values.amount;

        const baseTransaction: Omit<Transaction, 'status' | 'failureReason'> = {
            id: transactionId,
            amount: parsedAmount,
            currency: values.currency,
            timestamp: new Date().toISOString(),
            attempts: retryCount + 1,
            cardholderName: values.cardholderName,
            cardNumberLast4: values.cardNumber.replace(/\s/g, '').slice(-4),
        };

        try {
            const res = await fetch('/api/pay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    transactionId,
                    amount: parsedAmount,
                    currency: values.currency,
                }),
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                throw new Error(`Server error: ${res.status}`);
            }

            const data: GatewayResponse = await res.json();

            if (data.success) {
                dispatch(paymentSuccess({ ...baseTransaction, status: 'success' }));
            } else {
                const reason = data.reason ?? 'Payment was declined.';
                dispatch(
                    paymentFailed({
                        transaction: { ...baseTransaction, status: 'failed', failureReason: reason },
                        reason,
                    })
                );
            }
        } catch (err: unknown) {
            clearTimeout(timeoutId);

            const isAbort =
                err instanceof DOMException && err.name === 'AbortError';

            if (isAbort) {
                dispatch(
                    paymentTimeout({
                        ...baseTransaction,
                        status: 'timeout',
                        failureReason: 'Request timed out. Please try again.',
                    })
                );
            } else {
                const msg =
                    err instanceof Error ? err.message : 'Network error. Check your connection.';
                dispatch(
                    paymentFailed({
                        transaction: { ...baseTransaction, status: 'failed', failureReason: msg },
                        reason: msg,
                    })
                );
            }
        }
    }

    function reset() {
        dispatch(resetPayment());
    }

    const canRetry = retryCount < MAX_RETRIES;

    return { submitPayment, reset, status, retryCount, canRetry, MAX_RETRIES, currentTransactionId };
}