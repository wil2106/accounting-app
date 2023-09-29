const apiEndpoint = "http://localhost:5000/api";

const config = {
  LOGIN_ENDPOINT: `${apiEndpoint}/accountant/login`,
  CHECK_TOKEN_ENDPOINT: `${apiEndpoint}/accountant/check-token`,
  FETCH_CLIENTS_ENDPOINT: `${apiEndpoint}/clients`,
}

export default config;