import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  productSlug: null,
  step: 1,
  width: 100,
  height: 100,
  quantity: 50,
  material: 1,
  designText: 'RIDE BOLD',
  designMethod: 'online',
  templateId: 'bold-type',
  fontFamily: 'Arial Black',
  designColor: '#111317',
  logoName: '',
  artworkName: '',
  rotation: 0,
  scale: 1,
  approved: false,
};

const configuratorSlice = createSlice({
  name: 'configurator',
  initialState,
  reducers: {
    initializeConfigurator(state, action) {
      if (state.productSlug === action.payload.productSlug) return;
      Object.assign(state, initialState, action.payload);
    },
    setStep(state, action) { state.step = action.payload; },
    setWidth(state, action) { state.width = action.payload; },
    setHeight(state, action) { state.height = action.payload; },
    setQuantity(state, action) { state.quantity = action.payload; },
    setMaterial(state, action) { state.material = action.payload; },
    setDesignText(state, action) { state.designText = action.payload; },
    setDesignMethod(state, action) { state.designMethod = action.payload; },
    setTemplateId(state, action) { state.templateId = action.payload; },
    setFontFamily(state, action) { state.fontFamily = action.payload; },
    setDesignColor(state, action) { state.designColor = action.payload; },
    setLogoName(state, action) { state.logoName = action.payload; },
    setArtworkName(state, action) { state.artworkName = action.payload; },
    setRotation(state, action) { state.rotation = action.payload; },
    setScale(state, action) { state.scale = action.payload; },
    setApproved(state, action) { state.approved = action.payload; },
    resetConfigurator: () => initialState,
  },
});

export const {
  initializeConfigurator,
  setStep,
  setWidth,
  setHeight,
  setQuantity,
  setMaterial,
  setDesignText,
  setDesignMethod,
  setTemplateId,
  setFontFamily,
  setDesignColor,
  setLogoName,
  setArtworkName,
  setRotation,
  setScale,
  setApproved,
  resetConfigurator,
} = configuratorSlice.actions;
export default configuratorSlice.reducer;
