import {
  array,
  nullable,
  number,
  object,
  omit,
  optional,
  string,
} from 'valibot'

export const invoiceType = object({
  amount: number(),
  externalId: string(),
  fees: array(object({ type: string(), value: number() })),
  items: array(
    object({
      name: string(),
      price: number(),
      quantity: number(),
      referenceId: string(),
      category: string(),
    })
  ),
  customer: object({
    id: string(),
    email: string(),
    givenNames: optional(nullable(string())),
  }),
})

export const invoicePayloadType = object({
  type: string(),
  ...omit(invoiceType, ['customer', 'externalId']).entries,
})
