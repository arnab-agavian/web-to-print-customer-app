'use client';

import { useEffect, useRef } from 'react';
import { Provider, useSelector } from 'react-redux';
import { makeStore } from '@/redux/store/store';
import { restoreSession } from '@/redux/slices/authSlice';
import { LoadingScreen } from './LoadingState';

function AppBootstrap({ children }) {
  const restoreStatus = useSelector((state) => state.auth.restoreStatus);
  if (restoreStatus === 'idle' || restoreStatus === 'loading') {
    return <LoadingScreen label="Restoring your session…" />;
  }
  return children;
}

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

  return <Provider store={storeRef.current}><AppBootstrap>{children}</AppBootstrap></Provider>;
}
