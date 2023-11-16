import S from 'fluent-json-schema';

export const getFiscalMonthsSchema = {
  params: S.object()
  .prop('clientId', S.integer().required()),
  querystring: S.object()
  .prop('limit', S.integer().minimum(0).required())
  .prop('cursor', S.integer()),
  headers: S.object().prop('authorization', S.string().required()),
}