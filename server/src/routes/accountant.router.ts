import { FastifyInstance } from 'fastify'
import { authSchema, checkTokenSchema } from '../schema'
import * as controllers from '../controllers'

async function accountantRouter(fastify: FastifyInstance) {
  fastify.decorateRequest('authAccountant', '')

  fastify.route({
    method: 'POST',
    url: '/login',
    schema: authSchema,
    handler: controllers.login,
  });

  fastify.route({
    method: 'POST',
    url: '/check-token',
    schema: checkTokenSchema,
    handler: controllers.checkToken,
  });

  fastify.route({
    method: 'POST',
    url: '/signup',
    schema: authSchema,
    handler: controllers.signUp,
  });
}

export default accountantRouter
