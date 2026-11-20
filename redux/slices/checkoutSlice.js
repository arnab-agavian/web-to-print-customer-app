import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createOrder } from '@/redux/api/ordersApi';
import { processPayment } from '@/redux/api/checkoutApi';
import { sessionExpired, signOut } from './authSlice';

export const submitCheckout=createAsyncThunk('checkout/submit',async(payload,{rejectWithValue})=>{try{const isCod=payload.paymentMethod==='cod';const payment=isCod?null:await processPayment({amount:payload.amount,method:payload.paymentMethod});const order=await createOrder({...payload.order,configuration:{...payload.order.configuration,...(payment?.id?{paymentId:payment.id}:{})}});return{payment,order}}catch(error){return rejectWithValue(error.message)}});

const initialState={status:'idle',error:null,order:null,payment:null};

const checkoutSlice=createSlice({name:'checkout',initialState,reducers:{resetCheckout:()=>initialState},extraReducers:(builder)=>builder
  .addCase(submitCheckout.pending,(state)=>{state.status='loading';state.error=null})
  .addCase(submitCheckout.fulfilled,(state,action)=>{state.status='succeeded';state.order=action.payload.order;state.payment=action.payload.payment})
  .addCase(submitCheckout.rejected,(state,action)=>{state.status='failed';state.error=action.payload})
  .addMatcher((action)=>[signOut.fulfilled.type,signOut.rejected.type,sessionExpired.type].includes(action.type),()=>initialState)});

export const {resetCheckout}=checkoutSlice.actions;
export default checkoutSlice.reducer;
