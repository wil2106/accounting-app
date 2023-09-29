import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import utils from "../../helpers/utils";
import { RootState } from "../store";
import { Client } from "../../types";
import portfolioAPI, { FETCH_CLIENTS_LIMIT } from "./portfolioAPI";

export interface PortfolioState {
  clients: Client[];
  status: "idle" | "init-loading" | "next-loading" | "failed";
  reachedEnd: boolean;
  search: string;
}

const initialState: PortfolioState = {
  clients: [],
  status: "idle",
  reachedEnd: false,
  search: "",
};

export const fetchClients = createAsyncThunk(
  "auth/fetchClients",
  async (
    { init }: { init: boolean; },
    { dispatch, getState, rejectWithValue, fulfillWithValue }
  ) => {
    console.log("FATCH CLIENTS", init);
    try {
      if (init) {
        dispatch(portfolioSlice.actions.setInitLoadingStatus());
      } else {
        dispatch(portfolioSlice.actions.setNextLoadingStatus());
      }
      const state: any = await getState();
      if (state.portfolio.reachedEnd) {
        return fulfillWithValue({ clients: [], reachedEnd: true });
      }
      const cursor =
        state.portfolio.clients.length > 0
          ? state.portfolio.clients[state.portfolio.clients.length - 1].id
          : undefined;
      console.log(state.portfolio.search);
      const clients = await portfolioAPI.fetchClients(
        state.auth.token,
        state.portfolio.search,
        cursor
      );

      const reachedEnd = clients.length < FETCH_CLIENTS_LIMIT;

      return fulfillWithValue({
        clients: [...(state.portfolio.clients ?? []), ...clients],
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
    setInitLoadingStatus: (state) => {
      state = {...initialState, status: 'init-loading'};
    },
    setNextLoadingStatus: (state) => {
      state.status = 'next-loading';
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.status = "idle";
        state.clients = action.payload.clients;
        state.reachedEnd = action.payload.reachedEnd;
      })
      .addCase(fetchClients.rejected, (state, action) => {
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
export const selectPortfolioSearch = (state: RootState) =>
  state.portfolio.search;

export default portfolioSlice.reducer;
