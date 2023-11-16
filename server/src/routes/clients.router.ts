import { FastifyInstance } from 'fastify'
import * as controllers from '../controllers'
import { getClientsSchema } from '../schema'
import { checkValidRequest, checkValidAccountant } from '../helpers/shield';

async function clientsRouter(fastify: FastifyInstance) {
  fastify.decorateRequest('authAccountant', '')

  fastify.route({
    method: 'GET',
    url: '/',
    schema: getClientsSchema,
    preHandler: [checkValidRequest, checkValidAccountant],
    handler: controllers.getClients,
  })
}

export default clientsRouter;
