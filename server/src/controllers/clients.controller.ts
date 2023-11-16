import { FastifyReply } from "fastify";
import { utils } from "../helpers/utils";
import { IGetClientsRequest } from "../interfaces";
import { prisma } from '../helpers/utils'
import { STANDARD } from "../helpers/constants";

export const getClients = async (request: IGetClientsRequest, reply: FastifyReply) => {
  try {
    const { 
      limit,
      search,
      cursor,
     } = request.query;

     const {id} = request.authAccountant;

     const result = await prisma.client.findMany({
      where: {
        accountantId: id,  
        ...( search ? {
          name: {
            contains: search,
            mode: 'insensitive',
          },
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
        name: 'asc',
      }
     });

     if(!Array.isArray(result)){
      throw new Error('Result not an array');
     }

     reply.status(STANDARD.SUCCESS).send({ data: result })
     
  } catch (err) {
    utils.handleServerError(reply, err);
  }
}
