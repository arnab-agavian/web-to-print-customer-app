import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createAddress, deleteAddress, getAddress, getAddresses, getInvoices, getProfile, setDefaultAddress, updateAddress } from '@/redux/api/accountApi';
import { getSavedDesigns } from '@/redux/api/designsApi';

const addressList=(result)=>Array.isArray(result)?result:result?.addresses||result?.items||[];
const addressId=(address)=>address?.id||address?._id;
const addressResult=(result)=>result?.address||result;
const refreshAddresses=async()=>addressList(await getAddresses());

export const fetchDashboardData=createAsyncThunk('dashboard/fetch',async(_,{rejectWithValue})=>{try{const[profile,invoices,designs]=await Promise.all([getProfile(),getInvoices(),getSavedDesigns()]);return{profile,invoices,designs}}catch(error){return rejectWithValue(error.message)}});
export const fetchCustomerAddresses=createAsyncThunk('dashboard/getAddresses',async(_,{rejectWithValue})=>{try{return addressList(await getAddresses())}catch(error){return rejectWithValue(error.message)}});
export const fetchCustomerAddress=createAsyncThunk('dashboard/getAddress',async(id,{rejectWithValue})=>{try{return addressResult(await getAddress(id))}catch(error){return rejectWithValue(error.message)}});
export const createCustomerAddress=createAsyncThunk('dashboard/createAddress',async(address,{rejectWithValue})=>{try{await createAddress(address);return await refreshAddresses()}catch(error){return rejectWithValue(error.message)}});
export const updateCustomerAddress=createAsyncThunk('dashboard/updateAddress',async({id,address},{rejectWithValue})=>{try{await updateAddress(id,address);return await refreshAddresses()}catch(error){return rejectWithValue(error.message)}});
export const removeCustomerAddress=createAsyncThunk('dashboard/deleteAddress',async(id,{rejectWithValue})=>{try{await deleteAddress(id);return await refreshAddresses()}catch(error){return rejectWithValue(error.message)}});
export const makeCustomerAddressDefault=createAsyncThunk('dashboard/defaultAddress',async(id,{rejectWithValue})=>{try{await setDefaultAddress(id);return await refreshAddresses()}catch(error){return rejectWithValue(error.message)}});

const dashboardSlice=createSlice({name:'dashboard',initialState:{activeModule:'overview',profile:null,addresses:[],invoices:[],designs:[],status:'idle',addressStatus:'idle',addressError:null,error:null},reducers:{setDashboardModule(state,action){state.activeModule=action.payload}},extraReducers:(builder)=>builder
  .addCase(fetchDashboardData.pending,(state)=>{state.status='loading';state.error=null})
  .addCase(fetchDashboardData.fulfilled,(state,action)=>{state.status='succeeded';Object.assign(state,action.payload)})
  .addCase(fetchDashboardData.rejected,(state,action)=>{state.status='failed';state.error=action.payload})
  .addCase(fetchCustomerAddresses.pending,(state)=>{state.addressStatus='loading';state.addressError=null})
  .addCase(fetchCustomerAddresses.fulfilled,(state,action)=>{state.addressStatus='succeeded';state.addresses=action.payload})
  .addCase(fetchCustomerAddresses.rejected,(state,action)=>{state.addressStatus='failed';state.addressError=action.payload})
  .addCase(fetchCustomerAddress.pending,(state)=>{state.addressStatus='loading';state.addressError=null})
  .addCase(fetchCustomerAddress.fulfilled,(state,action)=>{state.addressStatus='succeeded';const id=addressId(action.payload);const index=state.addresses.findIndex((item)=>addressId(item)===id);if(index>=0)state.addresses[index]=action.payload;else if(action.payload)state.addresses.push(action.payload)})
  .addCase(fetchCustomerAddress.rejected,(state,action)=>{state.addressStatus='failed';state.addressError=action.payload})
  .addCase(createCustomerAddress.pending,(state)=>{state.addressStatus='loading';state.addressError=null})
  .addCase(createCustomerAddress.fulfilled,(state,action)=>{state.addressStatus='succeeded';state.addresses=action.payload})
  .addCase(createCustomerAddress.rejected,(state,action)=>{state.addressStatus='failed';state.addressError=action.payload})
  .addCase(updateCustomerAddress.pending,(state)=>{state.addressStatus='loading';state.addressError=null})
  .addCase(updateCustomerAddress.fulfilled,(state,action)=>{state.addressStatus='succeeded';state.addresses=action.payload})
  .addCase(updateCustomerAddress.rejected,(state,action)=>{state.addressStatus='failed';state.addressError=action.payload})
  .addCase(removeCustomerAddress.pending,(state)=>{state.addressStatus='loading';state.addressError=null})
  .addCase(removeCustomerAddress.fulfilled,(state,action)=>{state.addressStatus='succeeded';state.addresses=action.payload})
  .addCase(removeCustomerAddress.rejected,(state,action)=>{state.addressStatus='failed';state.addressError=action.payload})
  .addCase(makeCustomerAddressDefault.pending,(state)=>{state.addressStatus='loading';state.addressError=null})
  .addCase(makeCustomerAddressDefault.fulfilled,(state,action)=>{state.addressStatus='succeeded';state.addresses=action.payload})
  .addCase(makeCustomerAddressDefault.rejected,(state,action)=>{state.addressStatus='failed';state.addressError=action.payload})});

export const {setDashboardModule}=dashboardSlice.actions;
export default dashboardSlice.reducer;
