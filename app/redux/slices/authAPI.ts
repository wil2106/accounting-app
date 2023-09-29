import axios from 'axios';
import config from '../../config';

const login = async (email: string, password: string): Promise<{token: string}> => {
  const response = await axios.post(config.LOGIN_ENDPOINT, {email, password});
  if (!response.data?.token){
    throw new Error("No token in response");
  }
  return {token: response.data.token}
}

const checkToken = async (token: string) => {
  await axios.post(config.CHECK_TOKEN_ENDPOINT, {token});
}

export default {login, checkToken}