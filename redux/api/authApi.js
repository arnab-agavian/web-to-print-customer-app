import { apiInstance } from "./apiClient";

export const login = (credentials) =>
  apiInstance.post("/auth/login", credentials, { skipAuth: true });

export const signup = ({ email, password, fullName, phone }) =>
  apiInstance.post(
    "/auth/signup",
    {
      email: String(email || "").trim().toLowerCase(),
      password,
      fullName: String(fullName || "").trim(),
      phone: String(phone || "").replace(/[\s()-]/g, ""),
      role: "customer",
    },
    { skipAuth: true },
  );

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
