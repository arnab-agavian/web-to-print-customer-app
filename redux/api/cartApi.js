import { apiInstance } from "./apiClient";

export const getCart = () => apiInstance.get("/cart");
export const addCartItemRequest = (item) =>
  apiInstance.post("/cart/items", item);
export const updateCartItemRequest = (id, changes) =>
  apiInstance.put(`/cart/items/${id}`, changes);
export const removeCartItemRequest = (id) =>
  apiInstance.delete(`/cart/items/${id}`);
export const clearCartRequest = () => apiInstance.delete("/cart");
