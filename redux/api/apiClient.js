import axios from 'axios';
import { clearStoredSession, getAccessToken, getStoredSession, notifySessionExpired, storeSession } from './authSession';
import { demoApiAdapter } from './demoApi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const USE_DEMO_API = process.env.NEXT_PUBLIC_USE_DEMO_API !== 'false';
let refreshRequest = null;

const apiInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  ...(USE_DEMO_API ? { adapter: demoApiAdapter } : {}),
});

apiInstance.interceptors.request.use((config) => {
  if (!config.skipAuth) {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiInstance.interceptors.response.use(
  (response) => {
    const body = response.data;
    return body?.response?.data ?? body?.response ?? body;
  },
  async (error) => {
    if (axios.isCancel(error)) return Promise.reject(error);

    const request = error.config;
    const canRefresh = error.response?.status === 401
      && request
      && !request.skipAuth
      && !request.skipRefresh
      && !request._retry;

    if (canRefresh) {
      request._retry = true;
      const refreshToken = getStoredSession()?.refreshToken;

      if (refreshToken) {
        refreshRequest ||= apiInstance.post('/auth/refresh', { refreshToken }, {
          skipAuth: true,
          skipRefresh: true,
        })
          .then((result) => {
            storeSession(result.session);
            return result.session?.accessToken || null;
          })
          .catch(() => {
            clearStoredSession();
            return null;
          })
          .finally(() => { refreshRequest = null; });

        const refreshedToken = await refreshRequest;
        if (refreshedToken) {
          request.headers.Authorization = `Bearer ${refreshedToken}`;
          return apiInstance.request(request);
        }
      }

      clearStoredSession();
      notifySessionExpired();
    }

    const responseBody = error.response?.data;
    const apiError = new Error(responseBody?.message || responseBody?.error || error.message || 'Request failed');
    apiError.name = 'ApiError';
    apiError.status = error.response?.status || null;
    apiError.code = responseBody?.code || error.code || null;
    apiError.data = responseBody?.response?.data ?? responseBody?.data ?? null;
    return Promise.reject(apiError);
  },
);

export { API_URL, USE_DEMO_API, apiInstance };
