import axios from "axios";
import config from "../../config";
import { FiscalMonth } from "../../types";

export const FETCH_FISCAL_MONTHS_LIMIT = 10;

const fetchFiscalMonths = async (
  token: string,
  clientId: number,
  cursor?: number
): Promise<FiscalMonth[]> => {
  const res = await axios.get(
    config.FETCH_FISCAL_MONTHS_ENDPOINT.replace(":clientId", clientId.toString()),
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
      params: {
        limit: FETCH_FISCAL_MONTHS_LIMIT,
        ...(cursor ? { cursor } : {}),
      },
    }
  );
  return res.data.data;
};

export default { fetchFiscalMonths };
