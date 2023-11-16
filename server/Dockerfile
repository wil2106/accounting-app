FROM node:18-alpine

WORKDIR /app

COPY prisma ./prisma/
COPY package*.json ./

RUN npm install --frozen-lockfile

COPY . .

RUN npm run db:gen

CMD npm run db:push ; npm run db:seed ; npm run dev