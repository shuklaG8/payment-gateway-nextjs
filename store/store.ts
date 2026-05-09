import { configureStore } from '@reduxjs/toolkit';
import paymentReducer from './paymentSlice';
import { storageMiddleware } from './storageMiddleware';

export const store = configureStore({
  reducer: {
    payment: paymentReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(storageMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;