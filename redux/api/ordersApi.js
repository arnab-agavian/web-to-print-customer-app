import { apiInstance } from './apiClient';

export const getOrders = () => apiInstance.get('/orders');
export const getOrder = (orderId) => apiInstance.get(`/orders/${orderId}`);
export const createOrder = (order) => apiInstance.post('/orders', order);
export const reorder = (orderId) => apiInstance.post(`/orders/${orderId}/reorder`);
