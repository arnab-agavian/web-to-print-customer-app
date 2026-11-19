import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getProducts } from '@/redux/api/productsApi';
import { products as productPresentation } from '@/lib/data';

const presentationBySlug = Object.fromEntries(productPresentation.map((product) => [product.slug, product]));

const normalizeProduct = (product) => ({
  ...presentationBySlug[product.slug],
  ...product,
  minQty: product.minQuantity ?? presentationBySlug[product.slug]?.minQty ?? 1,
});

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const products = await getProducts();
      return Array.isArray(products) ? products.map(normalizeProduct) : [];
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load products.');
    }
  },
);

const productsSlice = createSlice({
  name: 'products',
  initialState: { items: productPresentation, status: 'idle', error: null },
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
