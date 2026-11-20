import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getDesign,
  getSavedDesigns,
  getTemplates,
  saveDesign as saveDesignRequest,
  validateDesign as validateDesignRequest,
} from "@/redux/api/designsApi";
import { uploadFile } from "@/redux/api/filesApi";

export const fetchDesignById = createAsyncThunk(
  "designs/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await getDesign(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchDesignResources = createAsyncThunk(
  "designs/fetchResources",
  async (_, { rejectWithValue }) => {
    try {
      const [templates, saved] = await Promise.all([
        getTemplates(),
        getSavedDesigns(),
      ]);
      return { templates, saved };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
export const validateCurrentDesign = createAsyncThunk(
  "designs/validate",
  async (design, { rejectWithValue }) => {
    try {
      return await validateDesignRequest(design);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
export const createDraftDesign = createAsyncThunk(
  "designs/createDraft",
  async (design, { rejectWithValue }) => {
    try {
      return await saveDesignRequest(design);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
export const uploadDesignFile = createAsyncThunk(
  "designs/uploadFile",
  async ({ file, category = "artwork" }, { rejectWithValue }) => {
    try {
      return await uploadFile(file, category);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
export const saveCurrentDesign = createAsyncThunk(
  "designs/save",
  async (design, { rejectWithValue }) => {
    try {
      return await saveDesignRequest(design);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const designsSlice = createSlice({
  name: "designs",
  initialState: {
    templates: [],
    saved: [],
    current: null,
    currentStatus: "idle",
    resourceStatus: "idle",
    validation: null,
    validationStatus: "idle",
    saveStatus: "idle",
    uploadStatus: "idle",
    uploadError: null,
    error: null,
  },
  reducers: {
    clearDesignValidation(state) {
      state.validation = null;
      state.current = null;
      state.currentStatus = "idle";
      state.validationStatus = "idle";
      state.saveStatus = "idle";
      state.uploadStatus = "idle";
      state.uploadError = null;
      state.error = null;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(fetchDesignById.pending, (state) => {
        state.currentStatus = "loading";
        state.error = null;
      })
      .addCase(fetchDesignById.fulfilled, (state, action) => {
        state.currentStatus = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchDesignById.rejected, (state, action) => {
        state.currentStatus = "failed";
        state.error = action.payload;
      })
      .addCase(fetchDesignResources.pending, (state) => {
        state.resourceStatus = "loading";
        state.error = null;
      })
      .addCase(fetchDesignResources.fulfilled, (state, action) => {
        state.resourceStatus = "succeeded";
        state.templates = action.payload.templates;
        state.saved = action.payload.saved;
      })
      .addCase(fetchDesignResources.rejected, (state, action) => {
        state.resourceStatus = "failed";
        state.error = action.payload;
      })
      .addCase(validateCurrentDesign.pending, (state) => {
        state.validationStatus = "loading";
        state.error = null;
      })
      .addCase(validateCurrentDesign.fulfilled, (state, action) => {
        state.validationStatus = "succeeded";
        state.validation = action.payload;
      })
      .addCase(validateCurrentDesign.rejected, (state, action) => {
        state.validationStatus = "failed";
        state.error = action.payload;
      })
      .addCase(createDraftDesign.pending, (state) => {
        state.saveStatus = "loading";
        state.currentStatus = "loading";
        state.error = null;
        state.current = null;
      })
      .addCase(createDraftDesign.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.currentStatus = "succeeded";
        state.current = action.payload;
        state.saved.unshift(action.payload);
      })
      .addCase(createDraftDesign.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.currentStatus = "failed";
        state.error = action.payload;
      })
      .addCase(uploadDesignFile.pending, (state) => {
        state.uploadStatus = "loading";
        state.uploadError = null;
      })
      .addCase(uploadDesignFile.fulfilled, (state) => {
        state.uploadStatus = "succeeded";
      })
      .addCase(uploadDesignFile.rejected, (state, action) => {
        state.uploadStatus = "failed";
        state.uploadError = action.payload;
      })
      .addCase(saveCurrentDesign.pending, (state) => {
        state.saveStatus = "loading";
        state.error = null;
      })
      .addCase(saveCurrentDesign.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.saved.unshift(action.payload);
      })
      .addCase(saveCurrentDesign.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.error = action.payload;
      }),
});

export const { clearDesignValidation } = designsSlice.actions;
export default designsSlice.reducer;
