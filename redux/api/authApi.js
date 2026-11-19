import { apiInstance } from "./apiClient";

export const login = (credentials) =>
  apiInstance.post("/auth/login", credentials, { skipAuth: true });

export const signup = (account) =>
  apiInstance.post("/auth/signup", account, { skipAuth: true });

export const refreshSession = (refreshToken) =>
  apiInstance.post(
    "/auth/refresh",
    { refreshToken },
    {
      skipAuth: true,
      skipRefresh: true,
    },
  );

export const getCurrentUser = () => apiInstance.get("/auth/me");
export const logout = () =>
  apiInstance.post("/auth/logout", null, { skipRefresh: true });
