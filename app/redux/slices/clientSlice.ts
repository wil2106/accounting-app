import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import utils from "../../helpers/utils";
import { RootState } from "../store";
import { Client, FiscalMonth } from "../../types";
import clientAPI, { FETCH_FISCAL_MONTHS_LIMIT } from "./clientAPI";

export interface ClientState {
  fiscalMonths: FiscalMonth[];
  status: "idle" | "init-loading" | "next-loading" | "failed";
  reachedEnd: boolean;
}

const initialState: ClientState = {
  fiscalMonths: [],
  status: "idle",
  reachedEnd: false,
};

export const fetchFirstFiscalMonths = createAsyncThunk(
  "client/fetchFirstFiscalMonths",
  async (
    { clientId }: { clientId: number },
    { dispatch, getState, rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const state: any = await getState();

      const fiscalMonths = await clientAPI.fetchFiscalMonths(
        state.auth.token,
        clientId
      );

      const reachedEnd = fiscalMonths.length < FETCH_FISCAL_MONTHS_LIMIT;

      return fulfillWithValue({
        fiscalMonths,
        reachedEnd,
      });
    } catch (err: any) {
      const message = utils.getErrorMessage(err);
      return rejectWithValue({ message });
    }
  }
);

export const fetchNextFiscalMonths = createAsyncThunk(
  "client/fetchNextFiscalMonths",
  async (
    { clientId }: { clientId: number },
    { dispatch, getState, rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const state: any = await getState();

      if (state.client.status === "init-loading" || state.client.reachedEnd) {
        return rejectWithValue({});
      }

      const cursor =
        state.client.fiscalMonths.length > 0
          ? state.client.fiscalMonths[state.client.fiscalMonths.length - 1].id
          : undefined;

      const fiscalMonths = await clientAPI.fetchFiscalMonths(
        state.auth.token,
        clientId,
        cursor
      );

      const reachedEnd = fiscalMonths.length < FETCH_FISCAL_MONTHS_LIMIT;

      return fulfillWithValue({
        fiscalMonths,
        reachedEnd,
      });
    } catch (err: any) {
      const message = utils.getErrorMessage(err);
      return rejectWithValue({ message });
    }
  }
);

export const clientSlice = createSlice({
  name: "client",
  initialState,
  reducers: {
    reset: (state) => {
      state = initialState;
    },
    addFiscalMonthBalance: (
      state,
      action: PayloadAction<{ fiscalMonthId: number; amount: number }>
    ) => {
      state.fiscalMonths = state.fiscalMonths.map((fiscalMonth) =>
        fiscalMonth.id === action.payload.fiscalMonthId
          ? {
              ...fiscalMonth,
              balance: fiscalMonth.balance + action.payload.amount,
            }
          : fiscalMonth
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFirstFiscalMonths.pending, (state) => {
        state.status = "init-loading";
        state.fiscalMonths = [];
        state.reachedEnd = false;
      })
      .addCase(fetchFirstFiscalMonths.fulfilled, (state, action) => {
        state.status = "idle";
        state.fiscalMonths = action.payload.fiscalMonths;
        state.reachedEnd = action.payload.reachedEnd;
      })
      .addCase(fetchFirstFiscalMonths.rejected, (state, action) => {
        state.status = "failed";
      })
      .addCase(fetchNextFiscalMonths.pending, (state) => {
        state.status = "next-loading";
      })
      .addCase(fetchNextFiscalMonths.fulfilled, (state, action) => {
        state.status = "idle";
        state.fiscalMonths = [
          ...state.fiscalMonths,
          ...action.payload.fiscalMonths,
        ];
        state.reachedEnd = action.payload.reachedEnd;
      })
      .addCase(fetchNextFiscalMonths.rejected, (state, action) => {
        state.status = "failed";
      });
  },
});

export const clientSliceActions = clientSlice.actions;

export const selectClientFiscalMonths = (state: RootState) =>
  state.client.fiscalMonths;
export const selectClientStatus = (state: RootState) => state.client.status;
export const selectClientReachedEnd = (state: RootState) =>
  state.client.reachedEnd;

export default clientSlice.reducer;
