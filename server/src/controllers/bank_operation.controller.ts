import { FastifyReply } from 'fastify'
import { ERROR400, STANDARD } from '../helpers/constants'
import { HandledError } from '../helpers/error'
import { prisma, utils } from '../helpers/utils'
import { IDeleteBankOperationRequest, IUpdateBankOperationRequest } from '../interfaces'

export const updateBankOperation = async (
  request: IUpdateBankOperationRequest,
  reply: FastifyReply,
) => {
  try {
    const { bankOperationId } = request.params;
    const { createdAt, wording, amount } = request.body;

    // check date validity
    if (createdAt !== undefined && isNaN(Date.parse(createdAt))){
      throw new HandledError(
        ERROR400.message,
        ERROR400.statusCode,
        "Invalid date for createdAt"
      );
    }

    const result = await prisma.bankOperation.update({
      where: {
        id: bankOperationId,
      },
      data: {
        ...(createdAt !== undefined ? {createdAt} : {}),
        ...(wording !== undefined ? {wording} : {}),
        ...(amount !== undefined ? {amount} : {}),
      }
    });

    reply.status(STANDARD.SUCCESS).send({data: result});

  } catch (err) {
    utils.handleServerError(reply, err)
  }
}

export const deleteBankOperation = async (
  request: IDeleteBankOperationRequest,
  reply: FastifyReply,
) => {
  try {
    const { bankOperationId } = request.params;

    await prisma.bankOperation.delete({
      where: {
        id: bankOperationId,
      }
    });

    reply.status(STANDARD.SUCCESS).send();

  } catch (err) {
    utils.handleServerError(reply, err)
  }
}