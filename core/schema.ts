import {
  type InferInput,
  enum as _enum,
  email,
  file,
  literal,
  maxLength,
  maxSize,
  minLength,
  nonEmpty,
  object,
  optional,
  pipe,
  string,
  transform,
  union,
} from 'valibot'
import { Bucket } from '@/core/config'

export function emailType(required = true) {
  const message = 'Email tidak valid'
  const _email = pipe(string(), email(message))

  return required ? _email : optional(union([_email, literal('')], message))
}

export function optionalStringType(min = 3, max = 999) {
  return optional(
    pipe(
      string(),
      transform((input) => (input.trim().match(/^\s*$/u) ? 'null' : input)),
      minLength(min, `Minimal ${min} karakter`),
      maxLength(max, `Maksimal ${max} karakter`)
    ),
    ''
  )
}

export function requiredStringType(min = 3, max = 999) {
  return pipe(
    string(),
    nonEmpty('Mohon diisi'),
    minLength(min, `Minimal ${min} karakter`),
    maxLength(max, `Maksimal ${max} karakter`)
  )
}

export type UploadPayload = InferInput<typeof uploadPayloadType>
export const uploadPayloadType = object({
  file: pipe(file(), maxSize(1024 * 1024 * 20)),
  fileName: string(),
  type: string(),
  bucket: _enum(Bucket),
  folder: string(),
})

export type UploadResponse = InferInput<typeof uploadResponseType>
export const uploadResponseType = object({
  fileId: string(),
  url: string(),
})

export type UploadCallback = UploadResponse & {
  removedFileId?: string
  index?: number
}
