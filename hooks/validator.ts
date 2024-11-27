import { useEffect } from 'react'
import { setValidity } from '@/helpers/client'

export const useValidator = (
  el: React.LegacyRef<HTMLElement>,
  schema?: any
) => {
  const track = (props?: React.HTMLAttributes<any>) => {
    return (e: any) => {
      props?.onChange?.(e)

      setValidity(el, schema)
    }
  }

  useEffect(() => setValidity(el, schema), [el, schema])
  return { track, validate: setValidity }
}
