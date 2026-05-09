import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PaymentStatus, Transaction } from '@/types';
import { loadTransactions, saveTransactions } from '@/utils/localStorage';

interface PaymentState {
  status: PaymentStatus;
  currentTransactionId: string | null;
  retryCount: number;
  failureReason: string | null;
  history: Transaction[];
  selectedTransaction: Transaction | null;
}

const initialState: PaymentState = {
  status: 'idle',
  currentTransactionId: null,
  retryCount: 0,
  failureReason: null,
  history: [],          // loaded client-side via initHistory
  selectedTransaction: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    initHistory(state) {
      state.history = loadTransactions();
    },
    startPayment(state, action: PayloadAction<string>) {
      state.status = 'processing';
      state.currentTransactionId = action.payload;
      state.failureReason = null;
    },
    retryPayment(state) {
      state.status = 'processing';
      state.retryCount += 1;
      state.failureReason = null;
    },
    paymentSuccess(state, action: PayloadAction<Transaction>) {
      state.status = 'success';
      state.retryCount = 0;
      const exists = state.history.findIndex(t => t.id === action.payload.id);
      if (exists >= 0) {
        state.history[exists] = action.payload;
      } else {
        state.history.unshift(action.payload);
      }
      saveTransactions(state.history);
    },
    paymentFailed(
      state,
      action: PayloadAction<{ transaction: Transaction; reason: string }>
    ) {
      state.status = 'failed';
      state.failureReason = action.payload.reason;
      const exists = state.history.findIndex(t => t.id === action.payload.transaction.id);
      if (exists >= 0) {
        state.history[exists] = action.payload.transaction;
      } else {
        state.history.unshift(action.payload.transaction);
      }
      saveTransactions(state.history);
    },
    paymentTimeout(state, action: PayloadAction<Transaction>) {
      state.status = 'timeout';
      const exists = state.history.findIndex(t => t.id === action.payload.id);
      if (exists >= 0) {
        state.history[exists] = action.payload;
      } else {
        state.history.unshift(action.payload);
      }
      saveTransactions(state.history);
    },
    resetPayment(state) {
      state.status = 'idle';
      state.currentTransactionId = null;
      state.retryCount = 0;
      state.failureReason = null;
    },
    selectTransaction(state, action: PayloadAction<Transaction | null>) {
      state.selectedTransaction = action.payload;
    },
  },
});

export const {
  initHistory,
  startPayment,
  retryPayment,
  paymentSuccess,
  paymentFailed,
  paymentTimeout,
  resetPayment,
  selectTransaction,
} = paymentSlice.actions;

export default paymentSlice.reducer;