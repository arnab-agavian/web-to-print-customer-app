import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getInvoices, getProfile, updateProfile as updateProfileRequest } from '@/redux/api/accountApi';
import { getSavedDesigns } from '@/redux/api/designsApi';

export const fetchDashboardData=createAsyncThunk('dashboard/fetch',async(_,{rejectWithValue})=>{try{const[profile,invoices,designs]=await Promise.all([getProfile(),getInvoices(),getSavedDesigns()]);return{profile,invoices,designs}}catch(error){return rejectWithValue(error.message)}});
export const updateCustomerProfile=createAsyncThunk('dashboard/updateProfile',async(profile,{rejectWithValue})=>{try{return await updateProfileRequest(profile)}catch(error){return rejectWithValue(error.message)}});

const dashboardSlice=createSlice({name:'dashboard',initialState:{activeModule:'overview',profile:null,invoices:[],designs:[],status:'idle',profileStatus:'idle',error:null},reducers:{setDashboardModule(state,action){state.activeModule=action.payload}},extraReducers:(builder)=>builder
  .addCase(fetchDashboardData.pending,(state)=>{state.status='loading';state.error=null})
  .addCase(fetchDashboardData.fulfilled,(state,action)=>{state.status='succeeded';Object.assign(state,action.payload)})
  .addCase(fetchDashboardData.rejected,(state,action)=>{state.status='failed';state.error=action.payload})
  .addCase(updateCustomerProfile.pending,(state)=>{state.profileStatus='loading';state.error=null})
  .addCase(updateCustomerProfile.fulfilled,(state,action)=>{state.profileStatus='succeeded';state.profile=action.payload})
  .addCase(updateCustomerProfile.rejected,(state,action)=>{state.profileStatus='failed';state.error=action.payload})});

export const {setDashboardModule}=dashboardSlice.actions;
export default dashboardSlice.reducer;
