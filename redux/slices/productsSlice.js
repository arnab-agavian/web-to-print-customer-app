import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getProductBySlug, getProducts } from '@/redux/api/productsApi';
import { normalizeProduct, normalizeProducts } from '@/lib/normalizeProduct';

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

export const fetchProductBySlug = createAsyncThunk(
  'products/fetchProductBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      return normalizeProduct(await getProductBySlug(slug));
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Unable to load this product.',
        status: error.status || null,
      });
    }
  },
  {
    condition: (slug, { getState }) => {
      const products = getState().products;
      return !(products.detailStatus === 'loading' && products.requestedSlug === slug);
    },
  },
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    current: null,
    requestedSlug: null,
    detailStatus: 'idle',
    detailError: null,
  },
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
      })
      .addCase(fetchProductBySlug.pending, (state, action) => {
        state.detailStatus = 'loading';
        state.detailError = null;
        state.requestedSlug = action.meta.arg;
        if (state.current?.slug !== action.meta.arg) state.current = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.current = null;
        state.detailError = action.payload || { message: action.error.message };
      });
  },
});

export default productsSlice.reducer;
