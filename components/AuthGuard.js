'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { LoadingScreen } from './LoadingState';

export default function AuthGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSelector((state) => state.auth.session);
  const isAuthenticated = Boolean(session?.accessToken);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname || '/dashboard/overview')}`);
    }
  }, [isAuthenticated, pathname, router]);

  if (!isAuthenticated) return <LoadingScreen label="Redirecting to sign in…" />;

  return children;
}
