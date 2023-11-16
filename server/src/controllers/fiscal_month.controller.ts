import { FastifyReply } from 'fastify'
import { ERROR400, STANDARD } from '../helpers/constants'
import { prisma, utils } from '../helpers/utils'
import { ICreateBankOperationRequest, IGetBankOperationsRequest } from '../interfaces'
import { HandledError } from '../helpers/error'

export const getBankOperations = async (
  request: IGetBankOperationsRequest,
  reply: FastifyReply,
) => {
  try {
    const { fiscalMonthId } = request.params;

    const { limit, search, cursor } = request.query;

    const searchId = parseInt(search);

    const result = await prisma.bankOperation.findMany({
      where: {
        fiscalMonthId,  
        ...( search ? {
          OR: [
            {
              wording: {
                contains: search,
                mode: 'insensitive',
              }
            },
            { 
              id: {
                equals: isNaN(searchId) ? -1 : searchId,
              }
            },
          ],
        } : {})
      },
      take: limit,
      ...( cursor ? {
          skip: 1,
          cursor: {
            id: cursor,
          },
        } : {}),
      orderBy: {
        createdAt: 'desc',
      }
     });

    if(!Array.isArray(result)){
      throw new Error('Result not an array');
    }

    reply.status(STANDARD.SUCCESS).send({ data: result });
  } catch (err) {
    utils.handleServerError(reply, err)
  }
}


export const createBankOperation = async (
  request: ICreateBankOperationRequest,
  reply: FastifyReply,
) => {
  try {
    const { fiscalMonthId } = request.params;
    const { createdAt, wording, amount } = request.body;

    // check date validity
    if (isNaN(Date.parse(createdAt))){
      throw new HandledError(
        ERROR400.message,
        ERROR400.statusCode,
        "Invalid date for createdAt"
      );
    }

    const result = await prisma.bankOperation.create({
      data: {
        createdAt,
        wording,
        amount,
        fiscalMonthId
      }
    });

    reply.status(STANDARD.SUCCESS).send({data: result});

  } catch (err) {
    utils.handleServerError(reply, err)
  }
}