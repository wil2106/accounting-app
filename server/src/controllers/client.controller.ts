import { FastifyReply, FastifyRequest } from 'fastify'
import { utils } from '../helpers/utils'
import { IGetFiscalMonthsRequest } from '../interfaces'
import { prisma } from '../helpers/utils'
import { STANDARD } from '../helpers/constants'
import { Prisma } from '@prisma/client'

export const getFiscalMonths = async (
  request: IGetFiscalMonthsRequest,
  reply: FastifyReply,
) => {
  try {
    const { clientId } = request.params;

    const { limit, cursor } = request.query;

    const result = await prisma.$queryRaw`
      SELECT f."id", f."date", f."clientId", f."controlBalance", f."controlBankStatementUrl", COALESCE(sum(b."amount")::int, 0) as "balance"
      FROM "FiscalMonth" as "f"
      FULL JOIN "BankOperation" as "b" ON f.id = b."fiscalMonthId"
      WHERE f."clientId" = ${clientId}
      ${cursor ? Prisma.sql`
        AND f."date" < (
            SELECT date
            FROM "FiscalMonth"
            WHERE id = ${cursor}
            LIMIT 1
        )
      ` : Prisma.empty}
      GROUP BY f."id", f."date", f."clientId", f."controlBalance", f."controlBankStatementUrl"
      ORDER BY date DESC
      ${limit ? Prisma.sql`LIMIT ${limit}` : Prisma.empty}
    `;

    if(!Array.isArray(result)){
      throw new Error('Result not an array');
    }

    reply.status(STANDARD.SUCCESS).send({ data: result });
  } catch (err) {
    utils.handleServerError(reply, err)
  }
}
