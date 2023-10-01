import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import utils from "../../helpers/utils";
import { RootState } from "../store";
import { BankOperation, Client } from "../../types";
import fiscalMonthAPI, { FETCH_BANK_OPERATIONS_LIMIT } from "./fiscalMonthAPI";
import { isValid, parseISO } from "date-fns";

export interface FiscalMonthState {
  bankOperations: BankOperation[];
  status: "idle" | "init-loading" | "next-loading" | "failed";
  reachedEnd: boolean;
  bankOperationLoading: boolean;
}

const initialState: FiscalMonthState = {
  bankOperations: [],
  status: "idle",
  reachedEnd: false,
  bankOperationLoading: false,
};

export const deleteBankOperation = createAsyncThunk(
  "fiscalMonth/deleteBankOperation",
  async (
    { bankOperationId }: { bankOperationId: number },
    { dispatch, getState, rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const state: any = await getState();

      await fiscalMonthAPI.deleteBankOperation(
        state.auth.token,
        bankOperationId
      );

      return fulfillWithValue({
        bankOperationId,
      });
    } catch (err: any) {
      const message = utils.getErrorMessage(err);
      return rejectWithValue({ message });
    }
  }
);

export const updateBankOperation = createAsyncThunk(
  "fiscalMonth/updateBankOperation",
  async (
    {
      bankOperationId,
      amount,
      description,
    }: { bankOperationId: number; amount: number; description: string },
    { dispatch, getState, rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const state: any = await getState();

      const bankOperation = await fiscalMonthAPI.updateBankOperation(
        state.auth.token,
        bankOperationId,
        amount,
        description
      );

      return fulfillWithValue({
        bankOperation,
      });
    } catch (err: any) {
      const message = utils.getErrorMessage(err);
      return rejectWithValue({ message });
    }
  }
);

export const createBankOperation = createAsyncThunk(
  "fiscalMonth/createBankOperation",
  async (
    {
      fiscalMonthId,
      amount,
      description,
    }: { fiscalMonthId: number; amount: number; description: string },
    { dispatch, getState, rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const state: any = await getState();

      const bankOperation = await fiscalMonthAPI.createBankOperation(
        state.auth.token,
        fiscalMonthId,
        amount,
        description
      );

      return fulfillWithValue({
        fiscalMonthId,
        bankOperation,
      });
    } catch (err: any) {
      const message = utils.getErrorMessage(err);
      return rejectWithValue({ message });
    }
  }
);

export const fetchFirstBankOperations = createAsyncThunk(
  "fiscalMonth/fetchFirstBankOperations",
  async (
    { fiscalMonthId, search }: { fiscalMonthId: number; search?: string },
    { dispatch, getState, rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const state: any = await getState();

      const bankOperations = await fiscalMonthAPI.fetchBankOperations(
        state.auth.token,
        fiscalMonthId,
        search
      );

      const reachedEnd = bankOperations.length < FETCH_BANK_OPERATIONS_LIMIT;

      return fulfillWithValue({
        bankOperations,
        reachedEnd,
      });
    } catch (err: any) {
      const message = utils.getErrorMessage(err);
      return rejectWithValue({ message });
    }
  }
);

export const fetchNextBankOperations = createAsyncThunk(
  "fiscalMonth/fetchNextBankOperations",
  async (
    { fiscalMonthId }: { fiscalMonthId: number },
    { dispatch, getState, rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const state: any = await getState();

      if (
        state.fiscalMonth.status === "init-loading" ||
        state.fiscalMonth.reachedEnd
      ) {
        return rejectWithValue({});
      }

      const cursor =
        state.fiscalMonth.bankOperations.length > 0
          ? state.fiscalMonth.bankOperations[
              state.fiscalMonth.bankOperations.length - 1
            ].id
          : undefined;

      const bankOperations = await fiscalMonthAPI.fetchBankOperations(
        state.auth.token,
        fiscalMonthId,
        undefined,
        cursor
      );

      const reachedEnd = bankOperations.length < FETCH_BANK_OPERATIONS_LIMIT;

      return fulfillWithValue({
        bankOperations,
        reachedEnd,
      });
    } catch (err: any) {
      const message = utils.getErrorMessage(err);
      return rejectWithValue({ message });
    }
  }
);

export const fiscalMonthSlice = createSlice({
  name: "fiscalMonth",
  initialState,
  reducers: {
    reset: (state) => {
      state = initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch first bank operations
      .addCase(fetchFirstBankOperations.pending, (state) => {
        state.status = "init-loading";
        state.bankOperations = [];
        state.reachedEnd = false;
      })
      .addCase(fetchFirstBankOperations.fulfilled, (state, action) => {
        state.status = "idle";
        state.bankOperations = action.payload.bankOperations;
        state.reachedEnd = action.payload.reachedEnd;
      })
      .addCase(fetchFirstBankOperations.rejected, (state, action) => {
        state.status = "failed";
      })
      // fetch next bank operations
      .addCase(fetchNextBankOperations.pending, (state) => {
        state.status = "next-loading";
      })
      .addCase(fetchNextBankOperations.fulfilled, (state, action) => {
        state.status = "idle";
        state.bankOperations = [
          ...state.bankOperations,
          ...action.payload.bankOperations,
        ];
        state.reachedEnd = action.payload.reachedEnd;
      })
      .addCase(fetchNextBankOperations.rejected, (state, action) => {
        state.status = "failed";
      })
      // delete bank operation
      .addCase(deleteBankOperation.fulfilled, (state, action) => {
        state.bankOperations = state.bankOperations.filter(
          (bankOperation) => bankOperation.id !== action.payload.bankOperationId
        );
      })
      // update bank operation
      .addCase(updateBankOperation.fulfilled, (state, action) => {
        state.bankOperationLoading = false;
        state.bankOperations = state.bankOperations.map((bo) =>
          bo.id === action.payload.bankOperation.id
            ? action.payload.bankOperation
            : bo
        );
      })
      .addCase(updateBankOperation.rejected, (state, action) => {
        state.bankOperationLoading = false;
      })
      .addCase(updateBankOperation.pending, (state) => {
        state.bankOperationLoading = true;
      })
      // create bank operation
      .addCase(createBankOperation.fulfilled, (state, action) => {
        state.bankOperationLoading = false;
        state.bankOperations = [
          ...state.bankOperations,
          action.payload.bankOperation,
        ];
      })
      .addCase(createBankOperation.rejected, (state, action) => {
        state.bankOperationLoading = false;
      })
      .addCase(createBankOperation.pending, (state) => {
        state.bankOperationLoading = true;
      });
  },
});

export const fiscalMonthSliceActions = fiscalMonthSlice.actions;

export const selectFiscalMonthBankOperations = (state: RootState) =>
  [...state.fiscalMonth.bankOperations].sort((a, b) => {
    const aDate = parseISO(a.createdAt);
    const bDate = parseISO(b.createdAt);
    if (isValid(aDate) && isValid(bDate)) {
      return aDate.getTime() - bDate.getTime();
    } else {
      return 0;
    }
  });
export const selectFiscalMonthStatus = (state: RootState) =>
  state.fiscalMonth.status;
export const selectFiscalMonthReachedEnd = (state: RootState) =>
  state.fiscalMonth.reachedEnd;
export const selectFiscalMonthBankOperationLoading = (state: RootState) =>
  state.fiscalMonth.bankOperationLoading;

export default fiscalMonthSlice.reducer;
