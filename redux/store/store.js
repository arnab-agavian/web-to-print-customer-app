import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/redux/slices/authSlice';
import cartReducer from '@/redux/slices/cartSlice';
import configuratorReducer from '@/redux/slices/configuratorSlice';
import ordersReducer from '@/redux/slices/ordersSlice';
import pricingReducer from '@/redux/slices/pricingSlice';
import productsReducer from '@/redux/slices/productsSlice';
import checkoutReducer from '@/redux/slices/checkoutSlice';
import dashboardReducer from '@/redux/slices/dashboardSlice';
import designsReducer from '@/redux/slices/designsSlice';

export function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      checkout: checkoutReducer,
      configurator: configuratorReducer,
      dashboard: dashboardReducer,
      designs: designsReducer,
      orders: ordersReducer,
      pricing: pricingReducer,
      products: productsReducer,
    },
  });
}
