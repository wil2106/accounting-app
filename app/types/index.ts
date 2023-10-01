export type Client = {
  id: number;
  pictureUrl?: string;
  name: string;
  accountantId: number;
}

export type FiscalMonth = {
  id: number;
  date: string;
  clientId: number;
  balance: number;
  controlBalance?: number;
  controlBankStatementUrl?: string;
}

export type BankOperation = {
  id: number;
  createdAt: string;
  wording: string;
  amount: number;
  fiscalMonthId: number;
}

export type AuthStackParamList = {
  LOGIN: undefined;
};

export type HomeStackParamList = {
  PORTFOLIO: undefined;
  CLIENT: {client?: Client};
  FISCAL_MONTH: {fiscalMonth?: FiscalMonth};
};
