import { FastifyInstance } from 'fastify'
import * as controllers from '../controllers'
import { deleteBankOperationSchema, updateBankOperationSchema } from '../schema'
import { checkValidRequest, checkValidAccountant, checkBankOperationManagedByAccountant } from '../helpers/shield';

async function bankOperationRouter(fastify: FastifyInstance) {
  fastify.decorateRequest('authAccountant', '')

  fastify.route({
    method: 'PATCH',
    url: '/:bankOperationId',
    schema: updateBankOperationSchema,
    preHandler: [checkValidRequest, checkValidAccountant, checkBankOperationManagedByAccountant],
    handler: controllers.updateBankOperation,
  });

  fastify.route({
    method: 'DELETE',
    url: '/:bankOperationId',
    schema: deleteBankOperationSchema,
    preHandler: [checkValidRequest, checkValidAccountant, checkBankOperationManagedByAccountant],
    handler: controllers.deleteBankOperation,
  });

}

export default bankOperationRouter;