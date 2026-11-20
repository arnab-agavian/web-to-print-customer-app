import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getProducts } from '@/redux/api/productsApi';
import { normalizeProducts } from '@/lib/normalizeProduct';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      return normalizeProducts(await getProducts());
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load products.');
    }
  },
);

const productsSlice = createSlice({
  name: 'products',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export default productsSlice.reducer;
