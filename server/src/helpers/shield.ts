import { FastifyReply, FastifyRequest } from 'fastify'
import * as JWT from 'jsonwebtoken'
import { IBankOperationRequest, IClientRequest, IDecoratorRequest, IFiscalMonthRequest, IGetFiscalMonthsRequest } from '../interfaces'
import { ERROR400, ERROR401, ERROR403 } from './constants'
import { HandledError } from './error'
import { prisma, utils } from './utils'

export const checkValidRequest = (
  request: FastifyRequest,
  reply: FastifyReply,
  done,
) => {
  try {
    let token = request.headers.authorization
    token = token.replace('Bearer ', '')
    if (!token) {
      throw new HandledError(
        ERROR400.message,
        ERROR400.statusCode,
        "Auth token missing"
      );
    }
    try {
      JWT.verify(token, process.env.APP_JWT_SECRET);
    } catch (e){
      throw new HandledError(
        ERROR401.message,
        ERROR401.statusCode,
        "Invalid token"
      );
    }
    done();
  } catch (e) {
    utils.handleServerError(reply, e);
  }
}

export const checkValidAccountant = async (
  request: IDecoratorRequest,
  reply: FastifyReply,
) => {
  try {
    let token = request.headers.authorization
    token = token.replace('Bearer ', '')

    if (!token) {
      throw new HandledError(
        ERROR400.message,
        ERROR400.statusCode,
        "Auth token missing"
      );
    }
    const accountant: any = JWT.verify(token, process.env.APP_JWT_SECRET)

    if (!accountant.id) {
      throw new Error("No accountant id");
    }

    const accountantData = await prisma.accountant.findUnique({ where: { id: accountant.id } })

    if (!accountantData) {
      throw new Error("No accountant data");
    }
    request.authAccountant = accountantData;
  } catch (e) {
    utils.handleServerError(reply, e);
  }
}

export const checkClientManagedByAccountant = async (
  request: IClientRequest,
  reply: FastifyReply,
) => {
  try {
    const { clientId } = request.params;
    const {id} = request.authAccountant;

    const aggregations = await prisma.client.aggregate({
      where: {
        id: clientId,
        accountantId: id,
      },
      _count: true,
    });
    
    if (aggregations._count === 0){
      throw new HandledError(
        ERROR403.message,
        ERROR403.statusCode,
        "Specified client is not managed by you"
      );
    }
  } catch (e) {
    utils.handleServerError(reply, e);
  }
}

export const checkFiscalMonthManagedByAccountant = async (
  request: IFiscalMonthRequest,
  reply: FastifyReply,
) => {
  try {
    const { fiscalMonthId } = request.params;
    const {id} = request.authAccountant;

    const aggregations = await prisma.fiscalMonth.aggregate({
      where: {
        id: fiscalMonthId,
        client: {
          accountantId: id,
        }
      },
      _count: true,
    });
    
    if (aggregations._count === 0){
      throw new HandledError(
        ERROR403.message,
        ERROR403.statusCode,
        "Specified fiscal month is not managed by you"
      );
    }
  } catch (e) {
    utils.handleServerError(reply, e);
  }
}

export const checkBankOperationManagedByAccountant = async (
  request: IBankOperationRequest,
  reply: FastifyReply,
) => {
  try {
    const { bankOperationId } = request.params;
    const {id} = request.authAccountant;

    const aggregations = await prisma.bankOperation.aggregate({
      where: {
        id: bankOperationId,
        fiscalMonth: {
          client: {
            accountantId: id,
          }
        }
      },
      _count: true,
    });
    
    if (aggregations._count === 0){
      throw new HandledError(
        ERROR403.message,
        ERROR403.statusCode,
        "Specified bank operation is not managed by you"
      );
    }
  } catch (e) {
    utils.handleServerError(reply, e);
  }
}