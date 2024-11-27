export const lf = (str: string) => str.replace(/\r/g, '')

export const crlf = (str: string) => {
  return str.replace(/\r/g, '\xA0\r').split('\n').filter(Boolean).join('\n')
}

export const delay = async (timer = 1000) => {
  return new Promise((res) => setTimeout(res, timer))
}

export const omit = <T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> => {
  keys.forEach((key) => delete obj[key])
  return obj
}

export const caller = <T extends any>(
  value: T
): T extends () => any ? ReturnType<T> : T => {
  return typeof value === 'function' ? value() : value
}

export const keys = <T extends object>(o: T) => {
  return Object.keys(o) as (keyof T)[]
}

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const unstrip = (str: string) => {
  return str.replace(/-/g, ' ')
}

export const capitalizeEach = (str: string, separator = ' ') => {
  return str.split(separator).map(capitalize).join(separator)
}

export const objectTrim = <T extends object>(o: T) => {
  const res = { ...o }

  for (const key in res) {
    const k = key as keyof typeof o

    if (typeof res[k] === 'string') {
      // @ts-ignore
      res[k] = res[k].trim()
    }
  }

  return res
}

export const formEntries = <T extends boolean>(
  form: FormData,
  trim = false
) => {
  const result = Object.fromEntries(form) as {
    [x: string]: T extends true ? string : string | undefined
  }
  return trim ? objectTrim(result) : result
}

export const getRandomLetters = (length = 1) => {
  return Array(length)
    .fill('')
    .map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 65))
    .join('')
}

export const getRandomDigits = (length = 1) => {
  return Array(length)
    .fill('')
    .map((e) => Math.floor(Math.random() * 10))
    .join('')
}
