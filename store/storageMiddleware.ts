import { Middleware } from '@reduxjs/toolkit';
import { saveTransactions } from '@/utils/localStorage';

export const storageMiddleware: Middleware = storeAPI => next => action => {
  const result = next(action);

  const act = action as { type?: string };

  if (
    act.type === 'payment/paymentSuccess' ||
    act.type === 'payment/paymentFailed' ||
    act.type === 'payment/paymentTimeout'
  ) {
    const state = storeAPI.getState() as any;
    saveTransactions(state.payment.history);
  }

  return result;
};
