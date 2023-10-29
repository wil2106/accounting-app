const apiEndpoint = "http://localhost:3000/api";

const config = {
  LOGIN_ENDPOINT: `${apiEndpoint}/accountant/login`,
  CHECK_TOKEN_ENDPOINT: `${apiEndpoint}/accountant/check-token`,
  FETCH_CLIENTS_ENDPOINT: `${apiEndpoint}/clients`,
  FETCH_FISCAL_MONTHS_ENDPOINT: `${apiEndpoint}/client/:clientId/fiscal-months`,
  FETCH_BANK_OPERATIONS_ENDPOINT: `${apiEndpoint}/fiscal-month/:fiscalMonthId/bank-operations`,
  DELETE_BANK_OPERATION_ENDPOINT: `${apiEndpoint}/bank-operation/:bankOperationId`,
  UPDATE_BANK_OPERATION_ENDPOINT: `${apiEndpoint}/bank-operation/:bankOperationId`,
  CREATE_BANK_OPERATION_ENDPOINT: `${apiEndpoint}/fiscal-month/:fiscalMonthId/bank-operations`,
}

export default config;