'use client';

import { useEffect, useRef } from 'react';
import { Provider, useSelector } from 'react-redux';
import { makeStore } from '@/redux/store/store';
import { restoreSession, sessionExpired } from '@/redux/slices/authSlice';
import { SESSION_EXPIRED_EVENT } from '@/redux/api/authSession';
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
    const hashParameters = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    if (hashParameters.has('access_token')) {
      window.location.replace('/login');
      return undefined;
    }

    const handleExpiredSession = () => storeRef.current.dispatch(sessionExpired());
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpiredSession);
    if (!restoredRef.current) {
      restoredRef.current = true;
      storeRef.current.dispatch(restoreSession());
    }
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpiredSession);
  }, []);

  return <Provider store={storeRef.current}><AppBootstrap>{children}</AppBootstrap></Provider>;
}
