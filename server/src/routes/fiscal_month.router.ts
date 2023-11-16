import { FastifyInstance } from 'fastify'
import * as controllers from '../controllers'
import { createBankOperationSchema, deleteBankOperationSchema, getBankOperationsSchema, updateBankOperationSchema } from '../schema'
import { checkValidRequest, checkValidAccountant, checkFiscalMonthManagedByAccountant } from '../helpers/shield';

async function fiscalMonthRouter(fastify: FastifyInstance) {
  fastify.decorateRequest('authAccountant', '')

  fastify.route({
    method: 'GET',
    url: '/:fiscalMonthId/bank-operations',
    schema: getBankOperationsSchema,
    preHandler: [checkValidRequest, checkValidAccountant, checkFiscalMonthManagedByAccountant],
    handler: controllers.getBankOperations,
  });

  fastify.route({
    method: 'POST',
    url: '/:fiscalMonthId/bank-operations',
    schema: createBankOperationSchema,
    preHandler: [checkValidRequest, checkValidAccountant, checkFiscalMonthManagedByAccountant],
    handler: controllers.createBankOperation,
  });
}

export default fiscalMonthRouter;