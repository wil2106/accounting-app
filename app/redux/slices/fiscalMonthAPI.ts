import axios from "axios";
import config from "../../config";
import { BankOperation } from "../../types";

export const FETCH_BANK_OPERATIONS_LIMIT = 10;

const fetchBankOperations = async (
  token: string,
  fiscalMonthId: number,
  search?: string,
  cursor?: number
): Promise<BankOperation[]> => {
  const res = await axios.get(
    config.FETCH_BANK_OPERATIONS_ENDPOINT.replace(
      ":fiscalMonthId",
      fiscalMonthId.toString()
    ),
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
      params: {
        limit: FETCH_BANK_OPERATIONS_LIMIT,
        ...(search ? { search } : {}),
        ...(cursor ? { cursor } : {}),
      },
    }
  );
  return res.data.data;
};

const deleteBankOperation = async (token: string, bankOperationId: number) => {
  await axios.delete(
    config.DELETE_BANK_OPERATION_ENDPOINT.replace(
      ":bankOperationId",
      bankOperationId.toString()
    ),
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
};

const updateBankOperation = async (
  token: string,
  bankOperationId: number,
  createdAt: string,
  amount: number,
  wording: string
): Promise<BankOperation> => {
  const res = await axios.patch(
    config.UPDATE_BANK_OPERATION_ENDPOINT.replace(
      ":bankOperationId",
      bankOperationId.toString()
    ),
    {
      createdAt,
      amount,
      wording,
    },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data.data;
};

const createBankOperation = async (
  token: string,
  fiscalMonthId: number,
  createdAt: string,
  amount: number,
  wording: string
): Promise<BankOperation> => {
  const res = await axios.post(
    config.CREATE_BANK_OPERATION_ENDPOINT.replace(
      ":fiscalMonthId",
      fiscalMonthId.toString()
    ),
    {
      createdAt,
      amount,
      wording,
    },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.data;
};

export default {
  fetchBankOperations,
  deleteBankOperation,
  updateBankOperation,
  createBankOperation
};
