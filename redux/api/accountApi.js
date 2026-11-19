import { apiInstance } from './apiClient';

export const getProfile = () => apiInstance.get('/account/profile');
export const updateProfile = (profile) => apiInstance.patch('/account/profile', profile);
export const getInvoices = () => apiInstance.get('/invoices');
