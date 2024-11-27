import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { object, parse, pick } from 'valibot'
import { auth } from '@/auth'
import { uploadPayloadType, uploadResponseType } from '@/core/schema'
import { formEntries } from '@/core/utils'
import Supabase from '@/lib/supabase'

const supabase = Supabase()

export const POST = async (request: NextRequest) => {
  if (!(await auth())?.user) {
    return NextResponse.json(
      { data: null, error: { message: 'Unauthorized' } },
      { status: 403 }
    )
  }

  try {
    const { file, fileName, bucket, folder } = parse(
      uploadPayloadType,
      formEntries(await request.formData())
    )

    const path = ['uploads', folder, fileName].join('/')
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true })

    if (error || !data) {
      return NextResponse.json(
        { data: null, error: { message: error.message } },
        { status: 500 }
      )
    }

    const publicUrl = supabase.storage.from(bucket).getPublicUrl(path)
    const url = publicUrl.data.publicUrl

    return NextResponse.json({
      data: { fileId: data.id, url },
      error: null,
    })
  } catch (e) {
    console.log(e)
  }

  return NextResponse.json(
    { data: null, error: { message: 'Internal Server Error' } },
    { status: 500 }
  )
}

export const DELETE = async (request: NextRequest) => {
  if (!(await auth())?.user) {
    return NextResponse.json(
      { data: null, error: { message: 'Unauthorized' } },
      { status: 403 }
    )
  }

  try {
    const schema = object({
      ...pick(uploadPayloadType, ['bucket', 'folder']).entries,
      ...pick(uploadResponseType, ['fileId']).entries,
    })

    const { bucket, folder, fileId } = parse(schema, await request.json())
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(['uploads', folder].join('/'))

    if (error || !data) {
      return NextResponse.json(
        { data: null, error: { message: error.message } },
        { status: 500 }
      )
    }

    const currentFile = data.find((item) => item.id === fileId)

    if (!currentFile) {
      return NextResponse.json(
        { data: null, error: { message: 'File not found' } },
        { status: 404 }
      )
    }

    const { error: errorRemove } = await supabase.storage
      .from(bucket)
      .remove([['uploads', folder, currentFile.name].join('/')])

    if (errorRemove) {
      return NextResponse.json(
        { data: null, error: { message: errorRemove.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { fileId }, error: null })
  } catch (e) {
    console.log(e)
  }

  return NextResponse.json(
    { data: null, error: { message: 'Internal Server Error' } },
    { status: 500 }
  )
}
