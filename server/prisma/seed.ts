import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  await prisma.bankOperation.deleteMany({})
  await prisma.fiscalMonth.deleteMany({})
  await prisma.client.deleteMany({})
  await prisma.accountant.deleteMany({})

  const accountant = await prisma.accountant.create({
    data: {
      email: 'test@gmail.com',
      password: '$2a$10$PAIoBlppOhF7hpncEnOXNe21A30VmaNCjUX2tqxdgweer5TFZxbqi',
    },
  })

  await prisma.client.createMany({
    data: [
      {
        pictureUrl: 'https://picsum.photos/201',
        name: 'Netflix SA',
        accountantId: accountant.id,
      },
      {
        pictureUrl: 'https://picsum.photos/202',
        name: 'Amazon SA',
        accountantId: accountant.id,
      },
      {
        pictureUrl: 'https://picsum.photos/203',
        name: 'Microsoft SA',
        accountantId: accountant.id,
      },
      {
        pictureUrl: 'https://picsum.photos/204',
        name: 'Intel SA',
        accountantId: accountant.id,
      },
      {
        pictureUrl: 'https://picsum.photos/205',
        name: 'Nvidia SA',
        accountantId: accountant.id,
      },
      {
        pictureUrl: 'https://picsum.photos/206',
        name: 'Google SA',
        accountantId: accountant.id,
      },
      {
        pictureUrl: 'https://picsum.photos/207',
        name: 'Uber SA',
        accountantId: accountant.id,
      },
      {
        pictureUrl: 'https://picsum.photos/208',
        name: 'Tesla SA',
        accountantId: accountant.id,
      },
      {
        pictureUrl: 'https://picsum.photos/209',
        name: 'Ford SA',
        accountantId: accountant.id,
      },
      {
        pictureUrl: 'https://picsum.photos/210',
        name: 'Meta SA',
        accountantId: accountant.id,
      },
      {
        pictureUrl: 'https://picsum.photos/211',
        name: 'Twitter SA',
        accountantId: accountant.id,
      },
    ],
  })

  const client = await prisma.client.create({
    data: {
      pictureUrl: 'https://picsum.photos/200',
      name: 'Apple SA',
      accountantId: accountant.id,
    },
  })

  const fiscalMonth1 = await prisma.fiscalMonth.create({
    data: {
      date: "2023-05-01T00:00:00.000Z",
      clientId: client.id,
      controlBalance: 100000,
      controlBankStatementUrl: "https://www.commercebank.com/-/media/cb/pdf/personal/bank/statement_sample1.pdf?revision=54d56c85-b8e2-40a4-bd17-e09697b71bc6&modified=20211119170100",
    },
  });

  const fiscalMonth2 = await prisma.fiscalMonth.create({
    data: {
      date: "2023-06-01T00:00:00.000Z",
      clientId: client.id,
      controlBalance: 550000,
      controlBankStatementUrl: null,
    },
  });

  await prisma.fiscalMonth.create({
    data: {
      date: "2023-07-01T00:00:00.000Z",
      clientId: client.id,
      controlBalance: null,
      controlBankStatementUrl: null,
    },
  });

  await prisma.bankOperation.createMany({
    data: [
      {
        createdAt: "2023-05-11T00:00:00.000Z",
        wording: "Apple park construction",
        amount: -50000,
        fiscalMonthId: fiscalMonth1.id,
      },
      {
        createdAt: "2023-05-16T00:00:00.000Z",
        wording: "Iphone sales",
        amount: 300000,
        fiscalMonthId: fiscalMonth1.id,
      },
      {
        createdAt: "2023-05-21T00:00:00.000Z",
        wording: "Taxes",
        amount: -20000,
        fiscalMonthId: fiscalMonth1.id,
      },
      {
        createdAt: "2023-06-03T00:00:00.000Z",
        wording: "Airpods sales",
        amount: 100000,
        fiscalMonthId: fiscalMonth2.id,
      },
      {
        createdAt: "2023-06-08T00:00:00.000Z",
        wording: "Ipad sales",
        amount: 300000,
        fiscalMonthId: fiscalMonth2.id,
      },
      {
        createdAt: "2023-06-14T00:00:00.000Z",
        wording: "Visio pro sales",
        amount: 100000,
        fiscalMonthId: fiscalMonth2.id,
      },
      {
        createdAt: "2023-06-19T00:00:00.000Z",
        wording: "Macbook sales",
        amount: 50000,
        fiscalMonthId: fiscalMonth2.id,
      },
    ],
  });
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
