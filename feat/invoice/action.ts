'use server'

import type { Invoice } from 'xendit-node/invoice/models'
import { parse } from 'valibot'
import { Invoice as InvoiceClient } from 'xendit-node'
import { getCheckUser } from '@/feat/auth/action'
import { wtf } from '@/helpers/server'
import { formEntries, getRandomDigits, getRandomLetters } from '@/core/utils'
import { invoiceType } from '@/feat/invoice/schema'
import { prisma } from '@/core/db'
import DayJS from '@/lib/dayjs'

// prettier-ignore
const isProduction = process.env.NEXT_PUBLIC_SITE_ENV === 'production'
// process.env.XENDIT_SECRET_KEY?.includes('xnd_production') ?? false

const invoiceClient = new InvoiceClient({
  secretKey: process.env.XENDIT_SECRET_KEY ?? '',
})

export async function expireInvoice(form: FormData) {
  await getCheckUser()

  try {
    const invoiceId = form.get('invoiceId')?.toString()
    if (!invoiceId) {
      throw new Error('"invoiceId" is not defined')
    }

    let invoice: Invoice

    if (isProduction) {
      invoice = await invoiceClient.expireInvoice({ invoiceId })
    } else {
      invoice = { status: 'EXPIRED', updated: new Date() } as Invoice
    }

    return { data: invoice, errorMessage: '' }
  } catch (e) {
    return wtf(e, 'Gagal memeriksa pembayaran.')
  }
}

export async function searchInvoice(form: FormData) {
  await getCheckUser()

  try {
    const invoiceId = form.get('invoiceId')?.toString()
    if (!invoiceId) {
      throw new Error('"invoiceId" is not defined')
    }

    let invoice: Invoice

    if (isProduction) {
      invoice = await invoiceClient.getInvoiceById({ invoiceId })
    } else {
      const { detail } = await prisma.purchase.findFirstOrThrow({
        where: { detail: { path: ['id'], equals: invoiceId } },
      })

      invoice = {
        ...(detail as any),
        status: 'PAID',
        updated: new Date(),
      } as Invoice
    }

    return { data: invoice, errorMessage: '' }
  } catch (e) {
    return wtf(e, 'Gagal memeriksa pembayaran.')
  }
}

export async function createInvoice(form: FormData) {
  await getCheckUser()

  try {
    const payload = formEntries<true>(form)
    const { amount, externalId, fees, customer, items } = parse(invoiceType, {
      ...payload,
      amount: +payload.amount,
      fees: JSON.parse(payload.fees),
      items: JSON.parse(payload.items),
      customer: JSON.parse(payload.customer),
    })

    let invoice: Invoice

    if (isProduction) {
      invoice = await invoiceClient.createInvoice({
        data: {
          amount,
          externalId,
          customer,
          fees,
          items,
        },
      })
    } else {
      invoice = {
        id: (getRandomDigits(3) + getRandomLetters(10)).toLowerCase(),
        amount,
        externalId,
        expiryDate: DayJS().tz().add(1, 'day').toDate(),
        invoiceUrl: '',
        status: 'PENDING',
        customer,
        fees,
        items,
        created: new Date(),
      } as Invoice
    }

    return {
      errorMessage: '',
      data: { ...invoice },
    }
  } catch (e) {
    return wtf(e, 'Gagal memproses pembayaran.')
  }
}
