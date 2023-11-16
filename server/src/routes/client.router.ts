import { FastifyInstance } from 'fastify'
import * as controllers from '../controllers'
import { getFiscalMonthsSchema } from '../schema'
import { checkValidRequest, checkValidAccountant, checkClientManagedByAccountant } from '../helpers/shield';

async function clientRouter(fastify: FastifyInstance) {
  fastify.decorateRequest('authAccountant', '')

  fastify.route({
    method: 'GET',
    url: '/:clientId/fiscal-months',
    schema: getFiscalMonthsSchema,
    preHandler: [checkValidRequest, checkValidAccountant, checkClientManagedByAccountant],
    handler: controllers.getFiscalMonths,
  })
}

export default clientRouter;