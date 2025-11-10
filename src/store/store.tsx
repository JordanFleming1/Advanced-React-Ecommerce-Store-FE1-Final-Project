import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice.tsx';

// Configure the Redux store
export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
  // Enable Redux DevTools in development
  devTools: true,
});

// TypeScript types for the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;