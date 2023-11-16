import S from 'fluent-json-schema';

export const getClientsSchema = {
    querystring: S.object()
      .prop('limit', S.integer().minimum(0).required())
      .prop('search', S.string())
      .prop('cursor', S.integer()),
    headers: S.object().prop('authorization', S.string().required()),
}