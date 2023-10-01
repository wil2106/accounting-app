import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import utils from "../../helpers/utils";
import { RootState } from "../store";
import { Client } from "../../types";
import portfolioAPI, { FETCH_CLIENTS_LIMIT } from "./portfolioAPI";

export interface PortfolioState {
  clients: Client[];
  status: "idle" | "init-loading" | "next-loading" | "failed";
  reachedEnd: boolean;
}

const initialState: PortfolioState = {
  clients: [],
  status: "idle",
  reachedEnd: false,
};

export const fetchFirstClients = createAsyncThunk(
  "portfolio/fetchFirstClients",
  async (
    { search }: { search?: string },
    { dispatch, getState, rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const state: any = await getState();
  
      const clients = await portfolioAPI.fetchClients(
        state.auth.token,
        search,
      );

      const reachedEnd = clients.length < FETCH_CLIENTS_LIMIT;

      return fulfillWithValue({
        clients,
        reachedEnd
      });
    } catch (err: any) {
      const message = utils.getErrorMessage(err);
      return rejectWithValue({ message });
    }
  }
);

export const fetchNextClients = createAsyncThunk(
  "portfolio/fetchNextClients",
  async (
    _,
    { dispatch, getState, rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const state: any = await getState();

      if (state.portfolio.status === "init-loading" || state.portfolio.reachedEnd){
        return rejectWithValue({});
      }

      const cursor =
        state.portfolio.clients.length > 0
          ? state.portfolio.clients[state.portfolio.clients.length - 1].id
          : undefined;

      const clients = await portfolioAPI.fetchClients(
        state.auth.token,
        undefined,
        cursor
      );

      const reachedEnd = clients.length < FETCH_CLIENTS_LIMIT;

      return fulfillWithValue({
        clients,
        reachedEnd
      });
    } catch (err: any) {
      const message = utils.getErrorMessage(err);
      return rejectWithValue({ message });
    }
  }
);

export const portfolioSlice = createSlice({
  name: "portfolio",
  initialState,
  reducers: {
    reset: (state) => {
      state = initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFirstClients.pending, (state) => {
        state.status = 'init-loading';
        state.clients = [];
        state.reachedEnd = false;
      })
      .addCase(fetchFirstClients.fulfilled, (state, action) => {
        state.status = "idle";
        state.clients = action.payload.clients;
        state.reachedEnd = action.payload.reachedEnd;
      })
      .addCase(fetchFirstClients.rejected, (state, action) => {
        state.status = "failed";
      })
      .addCase(fetchNextClients.pending, (state) => {
        state.status = 'next-loading';
      })
      .addCase(fetchNextClients.fulfilled, (state, action) => {
        state.status = "idle";
        state.clients = [...state.clients, ...action.payload.clients];
        state.reachedEnd = action.payload.reachedEnd;
      })
      .addCase(fetchNextClients.rejected, (state, action) => {
        state.status = "failed";
      });
  },
});

export const portfolioSliceActions = portfolioSlice.actions;

export const selectPortfolioClients = (state: RootState) =>
  state.portfolio.clients;
export const selectPortfolioStatus = (state: RootState) =>
  state.portfolio.status;
export const selectPortfolioReachedEnd = (state: RootState) =>
  state.portfolio.reachedEnd;

export default portfolioSlice.reducer;
