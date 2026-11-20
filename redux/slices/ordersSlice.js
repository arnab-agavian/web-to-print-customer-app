import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getOrder, getOrders, reorder } from '@/redux/api/ordersApi';
import { sessionExpired, signOut } from './authSlice';

const orderList = (result) => Array.isArray(result)
  ? result
  : result?.orders || result?.items || [];

const normalizeOrder = (order = {}) => {
  const lines = Array.isArray(order.items) ? order.items : [];
  const productNames = [...new Set(lines.map((line) =>
    line.product?.name
    || line.productName
    || line.product_name
    || line.product?.slug
    || line.productSlug,
  ).filter(Boolean))];
  const totalQuantity = lines.reduce((sum, line) => sum + Number(line.quantity || 0), 0);

  return {
    ...order,
    order_number: order.order_number || order.orderNumber || order.number || order.id,
    product_name: order.product_name
      || order.productName
      || (productNames.length > 1 ? `${productNames[0]} +${productNames.length - 1} more` : productNames[0])
      || 'Print order',
    product_slug: order.product_slug || order.productSlug || lines[0]?.product?.slug || lines[0]?.productSlug,
    quantity: Number(order.quantity || totalQuantity || 0),
    total: Number(order.total || order.summary?.total || 0),
    status: order.status || 'order',
    proof_status: order.proof_status || order.proofStatus || 'not_started',
    created_at: order.created_at || order.createdAt || order.updatedAt,
  };
};

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const orders = orderList(await getOrders()).map(normalizeOrder);
      return orders.sort((first, second) => new Date(second.created_at || 0) - new Date(first.created_at || 0));
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load orders.');
    }
  },
  {
    condition: (_, { getState }) => getState().orders.status !== 'loading',
  },
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const result = await getOrder(orderId);
      const order = Array.isArray(result) ? result[0] : result?.order || result;
      return normalizeOrder(order);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load this order.');
    }
  },
  {
    condition: (orderId, { getState }) => {
      const orders = getState().orders;
      return !(orders.currentStatus === 'loading' && orders.requestedOrderId === orderId);
    },
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

const initialState = {
  items: [],
  status: 'idle',
  error: null,
  current: null,
  requestedOrderId: null,
  currentStatus: 'idle',
  currentError: null,
  reorderingId: null,
};

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
      .addCase(fetchOrderById.pending, (state, action) => {
        state.currentStatus = 'loading';
        state.currentError = null;
        state.requestedOrderId = action.meta.arg;
        if (state.current?.id !== action.meta.arg) state.current = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.currentStatus = 'failed';
        state.currentError = action.payload || action.error.message;
      })
      .addCase(reorderOrder.pending, (state, action) => {
        state.reorderingId = action.meta.arg;
        state.error = null;
      })
      .addCase(reorderOrder.fulfilled, (state, action) => {
        state.reorderingId = null;
        state.items.unshift(normalizeOrder(action.payload));
      })
      .addCase(reorderOrder.rejected, (state, action) => {
        state.reorderingId = null;
        state.error = action.payload || action.error.message;
      })
      .addCase(signOut.fulfilled, () => initialState)
      .addCase(signOut.rejected, () => initialState)
      .addCase(sessionExpired, () => initialState);
  },
});

export const { resetOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
