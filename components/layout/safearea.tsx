import { tw } from '@/lib'

type SafeareaProps<T extends React.ElementType> = RPM<T> & {
  //
}

const Safearea = <T extends React.ElementType = 'p'>({
  as,
  className,
  ...props
}: SafeareaProps<T>) => {
  const Tag = as || 'div'

  return <Tag {...props} className={tw('mx-safe', className)} />
}

export default Safearea
