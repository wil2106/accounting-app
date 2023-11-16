import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../helpers/utils'
import * as JWT from 'jsonwebtoken'
import { utils } from '../helpers/utils'
import { ERROR400, ERROR401, ERROR404, ERROR409, STANDARD } from '../helpers/constants'
import { IAuthRequest, ICheckTokenRequest } from '../interfaces'
import { HandledError } from '../helpers/error'
import * as bcrypt from 'bcryptjs'

export const login = async (request: IAuthRequest, reply: FastifyReply) => {
  try {
    const { email, password } = request.body;
    const accountant = await prisma.accountant.findUnique({ where: { email: email } })
    if (!accountant) {
      throw new HandledError(
        ERROR404.message,
        ERROR404.statusCode,
        "Account with this email doesn't exists"
      );
    }
    const match = await bcrypt.compare(password, accountant.password);
    if (!match) {
      throw new HandledError(
        ERROR401.message,
        ERROR401.statusCode,
        "Wrong credentials"
      );
    }
    const token = JWT.sign(
      {
        id: accountant.id,
        email: accountant.email,
      },
      process.env.APP_JWT_SECRET,
      { expiresIn: '6h' }
    )
    delete accountant.password
    reply.code(STANDARD.SUCCESS).send({
      token,
      accountant,
    })
  } catch (err) {
    utils.handleServerError(reply, err);
  }
}

export const checkToken = async (request: ICheckTokenRequest, reply: FastifyReply) => {
  try {
    const { token } = request.body;
    try {
      JWT.verify(token, process.env.APP_JWT_SECRET);
    } catch (e){
      throw new HandledError(
        ERROR401.message,
        ERROR401.statusCode,
        "Invalid token"
      );
    };
    reply.code(STANDARD.SUCCESS).send();
  } catch (err) {
    utils.handleServerError(reply, err);
  }
}


export const signUp = async (request: IAuthRequest, reply: FastifyReply) => {
  try {
    const { email, password } = request.body;
    const user = await prisma.accountant.findUnique({ where: { email: email } })
    if (user) {
      throw new HandledError(
        ERROR409.message,
        ERROR409.statusCode,
        "Account already extisting"
      );
    }
    const hash = await bcrypt.hash(password, 10);
    const createAccountant = await prisma.accountant.create({
      data: {
        email,
        password: String(hash),
      },
    })
    const token = JWT.sign(
      {
        id: createAccountant.id,
        email: createAccountant.email,
      },
      process.env.APP_JWT_SECRET,
      { expiresIn: '6h' }
    )
    delete createAccountant.password
    reply.code(STANDARD.SUCCESS).send({
      token,
      user: createAccountant,
    })
  } catch (err) {
    utils.handleServerError(reply, err);
  }
}