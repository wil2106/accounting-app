import S from 'fluent-json-schema';

export const authSchema = {
    body: S.object()
        .prop('email', S.string().required())
        .prop('password', S.string().required()),
}

export const checkTokenSchema = {
  body: S.object()
      .prop('token', S.string().required())
}