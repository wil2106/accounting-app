import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import utils from "../../helpers/utils";
import { AppThunk, RootState } from "../store";
import authAPI from "./authAPI";
import { persist } from "../persist";

export interface AuthState {
  authenticated: boolean;
  token: string | null;
  status: 'idle' | 'loading' | 'failed';
  errorMessage: string | null;
}

const initialState: AuthState = {
  authenticated: false,
  token: null,
  status: 'idle',
  errorMessage: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({email, password}: {email:string, password: string}, {dispatch, getState, rejectWithValue, fulfillWithValue}) => {
    try {
      const response = await authAPI.login(email, password);
      return fulfillWithValue(response)
    } catch (err: any){
      const message = utils.getErrorMessage(err);
      return rejectWithValue({message});
    }
  }
);

export const autoLogin = createAsyncThunk(
  'auth/auto-login',
  async (_, {dispatch, getState, rejectWithValue, fulfillWithValue}) => {
    try {
      const state: any = await getState();
      if (!state.auth.token){
        return rejectWithValue({});
      }
      await authAPI.checkToken(state.auth.token);
      return fulfillWithValue({});
    } catch (err: any){
      const message = utils.getErrorMessage(err);
      return rejectWithValue({});
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.authenticated = false,
      state.token = null,
      state.status = 'idle',
      state.errorMessage = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.errorMessage = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'idle';
        state.authenticated = true;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.errorMessage = (action.payload as {message: string} ).message;
      })
      .addCase(autoLogin.pending, (state) => {
        state.status = 'loading';
        state.errorMessage = null;
      })
      .addCase(autoLogin.fulfilled, (state, action) => {
        state.status = 'idle';
        state.authenticated = true;
      })
      .addCase(autoLogin.rejected, (state, action) => {
        state.status = 'idle';
      });
  },
});

export const authSliceActions = authSlice.actions;

export const selectAuthAuthenticated = (state: RootState) => state.auth.authenticated;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthErrorMessage = (state: RootState) => state.auth.errorMessage;


export default persist(
  'auth',
  ['token'],
  authSlice.reducer,
);

