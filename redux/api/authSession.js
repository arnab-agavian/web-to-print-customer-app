const SESSION_KEY = 'digital-heroes-auth-session';

export function getStoredSession() {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(SESSION_KEY) || window.sessionStorage.getItem(SESSION_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function storeSession(session, persistent = true) {
  if (typeof window === 'undefined') return;
  clearStoredSession();
  if (session) {
    const storage = persistent ? window.localStorage : window.sessionStorage;
    storage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

export function clearStoredSession() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
  }
}

export function getAccessToken() {
  return getStoredSession()?.accessToken || null;
}
