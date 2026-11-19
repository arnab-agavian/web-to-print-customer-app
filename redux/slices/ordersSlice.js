import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getOrders, reorder } from '@/redux/api/ordersApi';
import { signOut } from './authSlice';

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const orders = await getOrders();
      return Array.isArray(orders) ? orders : [];
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load orders.');
    }
  },
);

export const reorderOrder = createAsyncThunk(
  'orders/reorderOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      return await reorder(orderId);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to reorder.');
    }
  },
);

const initialState = { items: [], status: 'idle', error: null, reorderingId: null };

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetOrders: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(reorderOrder.pending, (state, action) => {
        state.reorderingId = action.meta.arg;
        state.error = null;
      })
      .addCase(reorderOrder.fulfilled, (state, action) => {
        state.reorderingId = null;
        state.items.unshift(action.payload);
      })
      .addCase(reorderOrder.rejected, (state, action) => {
        state.reorderingId = null;
        state.error = action.payload || action.error.message;
      })
      .addCase(signOut.fulfilled, () => initialState)
      .addCase(signOut.rejected, () => initialState);
  },
});

export const { resetOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
