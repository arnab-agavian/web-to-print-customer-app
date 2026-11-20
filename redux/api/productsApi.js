import { apiInstance } from './apiClient';

export const getProducts = () => apiInstance.get('/products');
export const getProductBySlug = (slug) => apiInstance.get(`/products/${encodeURIComponent(slug)}`);
export const calculateProductPrice = (configuration, signal) => apiInstance.post(
  '/products/price',
  configuration,
  { signal },
);
