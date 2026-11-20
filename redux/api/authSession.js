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

export function decodeAccessToken(token = getAccessToken()) {
  if (typeof window === 'undefined' || !token || typeof token !== 'string') return null;

  try {
    const [, encodedPayload] = token.split('.');
    if (!encodedPayload) return null;

    const normalizedPayload = encodedPayload
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(encodedPayload.length / 4) * 4, '=');
    const payload = decodeURIComponent(
      window
        .atob(normalizedPayload)
        .split('')
        .map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );

    return JSON.parse(payload);
  } catch {
    return null;
  }
}
