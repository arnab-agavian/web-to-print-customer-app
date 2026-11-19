import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { calculateProductPrice } from '@/redux/api/productsApi';

export const fetchPrice = createAsyncThunk(
  'pricing/fetchPrice',
  async (configuration, { rejectWithValue, signal }) => {
    try {
      const price = await calculateProductPrice(configuration, signal);
      return {
        unit: price.unitPrice,
        subtotal: price.subtotal,
        tax: price.tax,
        total: price.total,
        discount: price.discountPercent,
      };
    } catch (error) {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') throw error;
      return rejectWithValue(error.message || 'Unable to calculate price.');
    }
  },
);

const pricingSlice = createSlice({
  name: 'pricing',
  initialState: { price: null, status: 'idle', error: null },
  reducers: {
    setEstimatedPrice(state, action) {
      state.price = action.payload;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrice.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPrice.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.price = action.payload;
      })
      .addCase(fetchPrice.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export const { setEstimatedPrice } = pricingSlice.actions;
export default pricingSlice.reducer;
