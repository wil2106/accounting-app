import axios from "axios";
import config from "../../config";
import { Client } from "../../types";

export const FETCH_CLIENTS_LIMIT = 10;

const fetchClients = async (token: string, search?: string, cursor?: number): Promise<Client[]> => {
  console.log(search, cursor);
  const res = await axios.get(config.FETCH_CLIENTS_ENDPOINT, {
    headers: {
      authorization: `Bearer ${token}`,
    },
    params: {
      limit: FETCH_CLIENTS_LIMIT,
      ...(search ? {search} : {}),
      ...(cursor ? {cursor} : {}),
    }
  });
  return res.data.data;
};

export default { fetchClients };
