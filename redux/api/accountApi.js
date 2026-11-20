import { apiInstance } from "./apiClient";

export const getProfile = () => apiInstance.get("/account/profile");
export const getAddresses = () => apiInstance.get("/addresses");
export const createAddress = (address) =>
  apiInstance.post("/addresses", address);
export const getAddress = (id) => apiInstance.get(`/addresses/${id}`);
export const updateAddress = (id, address) =>
  apiInstance.put(`/addresses/${id}`, address);
export const deleteAddress = (id) => apiInstance.delete(`/addresses/${id}`);
export const setDefaultAddress = (id) =>
  apiInstance.put(`/addresses/${id}/default`);
export const getInvoices = () => apiInstance.get("/invoices");
