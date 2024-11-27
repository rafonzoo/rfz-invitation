'use server'

import { ValiError, flatten } from 'valibot'

export async function wtf(
  e: unknown,
  errorMessage = 'Gagal menghubungkan ke server.'
) {
  if (e instanceof ValiError) {
    console.log(flatten(e.issues))
  }

  if (e instanceof Error) {
    console.log(e.message)
  }

  if (!(e instanceof ValiError) || !(e instanceof Error)) {
    console.log(e)
  }

  return { data: null, errorMessage }
}

export async function bufferToUri(file: File | Blob) {
  const fileBuffer = await (file instanceof Blob ? file.arrayBuffer() : null)
  const base64Data = fileBuffer
    ? Buffer.from(fileBuffer).toString('base64')
    : ''

  return 'data:' + file.type + ';' + 'base64' + ',' + base64Data
}
