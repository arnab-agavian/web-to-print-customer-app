'use client';

import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/redux/store/store';
import { restoreSession } from '@/redux/slices/authSlice';

export default function StoreProvider({ children }) {
  const storeRef = useRef(null);
  const restoredRef = useRef(false);

  if (!storeRef.current) storeRef.current = makeStore();

  useEffect(() => {
    if (!restoredRef.current) {
      restoredRef.current = true;
      storeRef.current.dispatch(restoreSession());
    }
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
