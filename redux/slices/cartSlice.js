import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  addCartItemRequest,
  clearCartRequest,
  getCart,
  removeCartItemRequest,
  updateCartItemRequest,
} from '@/redux/api/cartApi';
import { sessionExpired, signOut } from './authSlice';

const requestError = (error, rejectWithValue) => rejectWithValue(error.message);

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    return await getCart();
  } catch (error) {
    return requestError(error, rejectWithValue);
  }
});

export const addCartItem = createAsyncThunk('cart/addItem', async (item, { rejectWithValue }) => {
  try {
    return await addCartItemRequest(item);
  } catch (error) {
    return requestError(error, rejectWithValue);
  }
});

export const updateCartItem = createAsyncThunk('cart/updateItem', async ({ id, changes }, { rejectWithValue }) => {
  try {
    return await updateCartItemRequest(id, changes);
  } catch (error) {
    return requestError(error, rejectWithValue);
  }
});

export const removeCartItem = createAsyncThunk('cart/removeItem', async (id, { rejectWithValue }) => {
  try {
    return await removeCartItemRequest(id);
  } catch (error) {
    return requestError(error, rejectWithValue);
  }
});

export const clearServerCart = createAsyncThunk('cart/clearServer', async (_, { rejectWithValue }) => {
  try {
    return await clearCartRequest();
  } catch (error) {
    return requestError(error, rejectWithValue);
  }
});

const emptySummary = {
  currency: 'INR',
  itemCount: 0,
  totalQuantity: 0,
  subtotal: 0,
  tax: 0,
  total: 0,
};

function replaceCart(state, cart) {
  state.id = cart?.id ?? null;
  state.items = cart?.items || [];
  state.summary = cart?.summary || emptySummary;
}

const initialState = {
    id: null,
    items: [],
    summary: emptySummary,
    status: 'idle',
    mutationStatus: 'idle',
    error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Kept for the legacy configurator while the API-driven studio uses addCartItem.
    addToCart(state, action) {
      const existing = state.items.find((item) => item.key === action.payload.key);
      if (existing) existing.quantity += action.payload.quantity;
      else state.items.push(action.payload);
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
    clearCart(state) {
      replaceCart(state, null);
      state.status = 'idle';
      state.mutationStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => builder
    .addCase(fetchCart.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    })
    .addCase(fetchCart.fulfilled, (state, action) => {
      state.status = 'succeeded';
      replaceCart(state, action.payload);
    })
    .addCase(fetchCart.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    })
    .addMatcher(
      (action) => [addCartItem.pending.type, updateCartItem.pending.type, removeCartItem.pending.type, clearServerCart.pending.type].includes(action.type),
      (state) => {
        state.mutationStatus = 'loading';
        state.error = null;
      },
    )
    .addMatcher(
      (action) => [addCartItem.fulfilled.type, updateCartItem.fulfilled.type, removeCartItem.fulfilled.type, clearServerCart.fulfilled.type].includes(action.type),
      (state, action) => {
        state.mutationStatus = 'succeeded';
        state.status = 'succeeded';
        replaceCart(state, action.payload);
      },
    )
    .addMatcher(
      (action) => [addCartItem.rejected.type, updateCartItem.rejected.type, removeCartItem.rejected.type, clearServerCart.rejected.type].includes(action.type),
      (state, action) => {
        state.mutationStatus = 'failed';
        state.error = action.payload;
      },
    )
    .addMatcher(
      (action) => [signOut.fulfilled.type, signOut.rejected.type, sessionExpired.type].includes(action.type),
      () => initialState,
    ),
});

export const { addToCart, updateCartQuantity, clearCart } = cartSlice.actions;
export const selectCartCount = (state) => state.cart.status === 'succeeded'
  ? state.cart.summary.itemCount
  : state.cart.items.length;
export const selectCartSubtotal = (state) => state.cart.status === 'succeeded'
  ? state.cart.summary.subtotal
  : state.cart.items.reduce((total, item) => total + Number(item.price?.subtotal ?? item.subtotal ?? (item.total ? item.total / 1.18 : 0)), 0);
export const selectCartTax = (state) => state.cart.status === 'succeeded'
  ? state.cart.summary.tax
  : state.cart.items.reduce((total, item) => total + Number(item.price?.tax ?? item.tax ?? (item.total ? item.total - (item.total / 1.18) : 0)), 0);
export const selectCartTotal = (state) => state.cart.status === 'succeeded'
  ? state.cart.summary.total
  : state.cart.items.reduce((total, item) => total + Number(item.price?.total ?? item.total ?? 0), 0);
export default cartSlice.reducer;
