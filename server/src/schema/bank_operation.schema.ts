
import S from 'fluent-json-schema';

export const updateBankOperationSchema = {
  params: S.object()
  .prop('bankOperationId', S.integer().required()),
  body: S.object()
  .prop('createdAt', S.string())
  .prop('wording', S.string())
  .prop('amount', S.integer()),
  headers: S.object().prop('authorization', S.string().required()),
}

export const deleteBankOperationSchema = {
  params: S.object()
  .prop('bankOperationId', S.integer().required()),
  headers: S.object().prop('authorization', S.string().required()),
}