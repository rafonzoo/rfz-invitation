type FetchRequestOption = Omit<RequestInit, 'body'> & {
  method?: 'POST' | 'PATCH' | 'DELETE'
  body?: { [key: string]: any }
  throws?: [status: string | number, callbackFn: () => void][]
}

// The fetch request tools you ever need!
export async function fetchRequest<TResult = unknown>(
  url: string,
  opts: FetchRequestOption = {}
) {
  const { throws, body, method, ...options } = opts
  const response = await fetch(url, {
    ...options,
    body: body ? JSON.stringify(body) : void 0,
    method: body ? method ?? 'POST' : void 0,
    headers: body
      ? {
          'Content-Type': 'application/json',
          ...options.headers,
        }
      : options.headers,
  })

  if (!response.ok && throws) {
    for (let i = 0; i < throws.length; i++) {
      const [statusOrStatusText, callbackFn] = throws[i]
      const isStatusText = typeof statusOrStatusText === 'string'

      // prettier-ignore
      switch (response[isStatusText ? 'statusText' : 'status']) {
        case statusOrStatusText: throw callbackFn()
      }
    }
  }

  return (await response.json()) as TResult
}

// export function abspath(path: string) {
//   return `${process.env.NEXT_SITE_URL}` + path
// }
