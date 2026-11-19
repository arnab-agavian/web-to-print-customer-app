import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getCurrentUser, login, logout, signup } from '@/redux/api/authApi';
import { clearStoredSession, getStoredSession, storeSession } from '@/redux/api/authSession';

const errorMessage = (error, fallback) => error?.message || fallback;

export const signIn = createAsyncThunk(
  'auth/signIn',
  async (credentials, { rejectWithValue }) => {
    try {
      const { remember, ...loginCredentials } = credentials;
      const result = await login(loginCredentials);
      storeSession(result.session, remember);
      return result;
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to sign in.'));
    }
  },
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async (account, { rejectWithValue }) => {
    try {
      const result = await signup(account);
      if (result.session) storeSession(result.session);
      return result;
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to create account.'));
    }
  },
);

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    const session = getStoredSession();
    if (!session) return null;
    try {
      const result = await getCurrentUser();
      return { user: result.user, session: getStoredSession() };
    } catch (error) {
      clearStoredSession();
      return rejectWithValue(errorMessage(error, 'Session expired.'));
    }
  },
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await logout();
      clearStoredSession();
      return true;
    } catch (error) {
      clearStoredSession();
      return rejectWithValue(errorMessage(error, 'Signed out locally.'));
    }
  },
);

const initialState = {
  user: null,
  session: null,
  restoreStatus: 'idle',
  loginStatus: 'idle',
  loginError: null,
  signupStatus: 'idle',
  signupError: null,
  signupComplete: false,
  requiresEmailConfirmation: false,
  logoutStatus: 'idle',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthFeedback(state) {
      state.loginError = null;
      state.signupError = null;
      state.signupComplete = false;
      state.requiresEmailConfirmation = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.loginStatus = 'loading';
        state.loginError = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loginStatus = 'succeeded';
        state.user = action.payload.user;
        state.session = action.payload.session;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loginStatus = 'failed';
        state.loginError = action.payload || action.error.message;
      })
      .addCase(signUp.pending, (state) => {
        state.signupStatus = 'loading';
        state.signupError = null;
        state.signupComplete = false;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.signupStatus = 'succeeded';
        state.signupComplete = true;
        state.requiresEmailConfirmation = action.payload.requiresEmailConfirmation;
        state.user = action.payload.user;
        state.session = action.payload.session;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.signupStatus = 'failed';
        state.signupError = action.payload || action.error.message;
      })
      .addCase(restoreSession.pending, (state) => {
        state.restoreStatus = 'loading';
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.restoreStatus = 'succeeded';
        if (action.payload) {
          state.user = action.payload.user;
          state.session = action.payload.session;
        }
      })
      .addCase(restoreSession.rejected, (state) => {
        state.restoreStatus = 'failed';
        state.user = null;
        state.session = null;
      })
      .addCase(signOut.pending, (state) => {
        state.logoutStatus = 'loading';
      })
      .addCase(signOut.fulfilled, () => ({ ...initialState, restoreStatus: 'succeeded' }))
      .addCase(signOut.rejected, () => ({ ...initialState, restoreStatus: 'succeeded' }));
  },
});

export const { clearAuthFeedback } = authSlice.actions;
export default authSlice.reducer;
