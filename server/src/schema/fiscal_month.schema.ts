import S from 'fluent-json-schema';

export const getBankOperationsSchema = {
  params: S.object()
  .prop('fiscalMonthId', S.integer().required()),
  querystring: S.object()
  .prop('limit', S.integer().minimum(0).required())
  .prop('search', S.string())
  .prop('cursor', S.integer()),
  headers: S.object().prop('authorization', S.string().required()),
}

export const createBankOperationSchema = {
  params: S.object()
  .prop('fiscalMonthId', S.integer().required()),
  body: S.object()
  .prop('createdAt', S.string().required())
  .prop('wording', S.string().required())
  .prop('amount', S.integer().required()),
  headers: S.object().prop('authorization', S.string().required()),
}