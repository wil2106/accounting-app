import { FastifyRequest } from 'fastify';
import { Prisma, Accountant } from '@prisma/client';

export interface IAccountantAuthToken {
    id: number;
    email: string;
}

export interface IDecoratorRequest extends FastifyRequest {
  authAccountant: Accountant;
}

export interface ICheckTokenRequest extends FastifyRequest {
  body: {
    token: string;
  }
}

export interface IAuthRequest extends IDecoratorRequest {
  body: Prisma.AccountantCreateInput;
}

export interface IGetClientsRequest extends IDecoratorRequest {
  query: {
    limit: number;
    search?: string;
    cursor?: number;
  }
}

export interface IClientRequest extends IDecoratorRequest {
  params: {
    clientId: number;
  },
}

export interface IGetFiscalMonthsRequest extends IClientRequest {
  query: {
    limit: number;
    cursor?: number;
  }
}

export interface IFiscalMonthRequest extends IDecoratorRequest {
  params: {
    fiscalMonthId: number;
  },
}

export interface IGetBankOperationsRequest extends IFiscalMonthRequest {
  query: {
    limit: number;
    search?: string;
    cursor?: number;
  }
}

export interface ICreateBankOperationRequest extends IFiscalMonthRequest {
  body: {
    createdAt: string;
    wording: string;
    amount: number;
  }
}

export interface IBankOperationRequest extends IDecoratorRequest {
  params: {
    bankOperationId: number;
  },
}

export interface IUpdateBankOperationRequest extends IBankOperationRequest {
  body: {
    createdAt?: string;
    wording?: string;
    amount?: number;
  }
}

export interface IDeleteBankOperationRequest extends IBankOperationRequest {}