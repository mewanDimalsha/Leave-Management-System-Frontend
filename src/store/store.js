import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import leavesReducer from './slices/leavesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    leaves: leavesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
