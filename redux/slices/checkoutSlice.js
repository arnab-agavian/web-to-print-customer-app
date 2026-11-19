import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createOrder } from '@/redux/api/ordersApi';
import { processPayment } from '@/redux/api/checkoutApi';

export const submitCheckout=createAsyncThunk('checkout/submit',async(payload,{rejectWithValue})=>{try{const payment=await processPayment({amount:payload.total,method:payload.paymentMethod});const order=await createOrder({...payload,paymentId:payment.id});return{payment,order}}catch(error){return rejectWithValue(error.message)}});

const checkoutSlice=createSlice({name:'checkout',initialState:{status:'idle',error:null,order:null,payment:null},reducers:{resetCheckout:()=>({status:'idle',error:null,order:null,payment:null})},extraReducers:(builder)=>builder
  .addCase(submitCheckout.pending,(state)=>{state.status='loading';state.error=null})
  .addCase(submitCheckout.fulfilled,(state,action)=>{state.status='succeeded';state.order=action.payload.order;state.payment=action.payload.payment})
  .addCase(submitCheckout.rejected,(state,action)=>{state.status='failed';state.error=action.payload})});

export const {resetCheckout}=checkoutSlice.actions;
export default checkoutSlice.reducer;
