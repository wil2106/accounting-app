import * as bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { FastifyReply } from 'fastify'
import { ERROR400, ERROR500 } from './constants'

export const prisma = new PrismaClient()

export const utils = {
  handleServerError: (reply: FastifyReply, error: any) => {
    if (error?.statusCode) {
      return reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        message: error.message,
        reason: error.reason,
      });
    } else if(error?.validation) {
      return reply.status(ERROR400.statusCode).send({
        statusCode: ERROR400.statusCode,
        message: ERROR400.message,
        reason: error.message,
      });
    } else {
      console.error(error.message);
      return reply.status(ERROR500.statusCode).send(ERROR500);
    }
  },
  healthCheck: (): Promise<void> => {
    return prisma.$queryRaw`SELECT 1`;
  }
}
