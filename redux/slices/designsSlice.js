import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getSavedDesigns, getTemplates, saveDesign as saveDesignRequest, validateDesign as validateDesignRequest } from '@/redux/api/designsApi';

export const fetchDesignResources = createAsyncThunk('designs/fetchResources',async(_,{rejectWithValue})=>{try{const [templates,saved]=await Promise.all([getTemplates(),getSavedDesigns()]);return{templates,saved}}catch(error){return rejectWithValue(error.message)}});
export const validateCurrentDesign = createAsyncThunk('designs/validate',async(design,{rejectWithValue})=>{try{return await validateDesignRequest(design)}catch(error){return rejectWithValue(error.message)}});
export const saveCurrentDesign = createAsyncThunk('designs/save',async(design,{rejectWithValue})=>{try{return await saveDesignRequest(design)}catch(error){return rejectWithValue(error.message)}});

const designsSlice=createSlice({name:'designs',initialState:{templates:[],saved:[],resourceStatus:'idle',validation:null,validationStatus:'idle',saveStatus:'idle',error:null},reducers:{clearDesignValidation(state){state.validation=null;state.validationStatus='idle';state.error=null}},extraReducers:(builder)=>builder
  .addCase(fetchDesignResources.pending,(state)=>{state.resourceStatus='loading';state.error=null})
  .addCase(fetchDesignResources.fulfilled,(state,action)=>{state.resourceStatus='succeeded';state.templates=action.payload.templates;state.saved=action.payload.saved})
  .addCase(fetchDesignResources.rejected,(state,action)=>{state.resourceStatus='failed';state.error=action.payload})
  .addCase(validateCurrentDesign.pending,(state)=>{state.validationStatus='loading';state.error=null})
  .addCase(validateCurrentDesign.fulfilled,(state,action)=>{state.validationStatus='succeeded';state.validation=action.payload})
  .addCase(validateCurrentDesign.rejected,(state,action)=>{state.validationStatus='failed';state.error=action.payload})
  .addCase(saveCurrentDesign.pending,(state)=>{state.saveStatus='loading';state.error=null})
  .addCase(saveCurrentDesign.fulfilled,(state,action)=>{state.saveStatus='succeeded';state.saved.unshift(action.payload)})
  .addCase(saveCurrentDesign.rejected,(state,action)=>{state.saveStatus='failed';state.error=action.payload})});

export const {clearDesignValidation}=designsSlice.actions;
export default designsSlice.reducer;
