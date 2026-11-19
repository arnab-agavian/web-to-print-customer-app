import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    addToCart(state, action) {
      const existing = state.items.find((item) => item.key === action.payload.key);
      if (existing) existing.quantity += action.payload.quantity;
      else state.items.push(action.payload);
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((item) => item.key !== action.payload);
    },
    updateCartQuantity(state, action) {
      const item = state.items.find((entry) => entry.key === action.payload.key);
      if (item) {
        const nextQuantity = Math.max(1, action.payload.quantity);
        const ratio = nextQuantity / item.quantity;
        item.quantity = nextQuantity;
        item.subtotal = Number((item.subtotal * ratio).toFixed(2));
        item.tax = Number((item.tax * ratio).toFixed(2));
        item.total = Number((item.total * ratio).toFixed(2));
      }
    },
    clearCart(state) { state.items = []; },
  },
});

export const { addToCart, removeFromCart, updateCartQuantity, clearCart } = cartSlice.actions;
export const selectCartCount = (state) => state.cart.items.length;
export const selectCartSubtotal = (state) => state.cart.items.reduce((total,item)=>total+Number(item.subtotal??item.total/1.18??0),0);
export const selectCartTax = (state) => state.cart.items.reduce((total,item)=>total+Number(item.tax??item.total-(item.total/1.18)??0),0);
export const selectCartTotal = (state) => state.cart.items.reduce((total,item)=>total+Number(item.total||0),0);
export default cartSlice.reducer;
