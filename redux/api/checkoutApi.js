import { apiInstance } from './apiClient';

export const processPayment = (payment) => apiInstance.post('/payments', payment);
