import { utils } from './helpers/utils'
import fastify from 'fastify'
import pino from 'pino'
import accountantRouter from './routes/accountant.router'
import clientsRouter from './routes/clients.router'
import loadConfig from './config'
import clientRouter from './routes/client.router'
import fiscalMonthRouter from './routes/fiscal_month.router'
import bankOperationRouter from './routes/bank_operation.router'
loadConfig()

const port = process.env.API_PORT || 3000

const startServer = async () => {
  try {
    const server = fastify({
      logger: pino({ level: 'info' }),
    })
    server.register(accountantRouter, { prefix: '/api/accountant' })
    server.register(clientsRouter, { prefix: '/api/clients' })
    server.register(clientRouter, { prefix: '/api/client' })
    server.register(fiscalMonthRouter, { prefix: '/api/fiscal-month' })
    server.register(bankOperationRouter, { prefix: '/api/bank-operation' })
    server.setErrorHandler((error, request, reply) => {
      utils.handleServerError(reply, error)
    })
    server.get('/', (request, reply) => {
      reply.send({ name: 'dougs-api' })
    })
    server.get('/health-check', async (request, reply) => {
      try {
        await utils.healthCheck()
        reply.status(200).send()
      } catch (e) {
        server.log.error(e)
        reply.status(500).send()
      }
    })
    if (process.env.NODE_ENV === 'production') {
      for (const signal of ['SIGINT', 'SIGTERM']) {
        process.on(signal, () =>
          server.close().then((err) => {
            console.log(`close application on ${signal}`)
            process.exit(err ? 1 : 0)
          }),
        )
      }
    }
    await server.listen(port, '0.0.0.0');
  } catch (e) {
    console.error(e)
  }
}

process.on('unhandledRejection', (e) => {
  console.error(e)
  process.exit(1)
})

startServer()
