type EL = React.JSX.IntrinsicElements

type RC<T = {}> = Readonly<T & { children?: React.ReactNode }>

type RF<T = {}> = React.FC<RC<T>>

type RFZ<T = {}> = React.FC<T>

type RFA<T = {}> = RF<T & { enableAnimation?: boolean }>

type RFC<T, X> = React.ForwardRefRenderFunction<X, T>

type TAG<T extends keyof EL> = EL[T] & { schema?: any }

type Action<T> = Promise<{ data: T | null; message: string }>

type RPM<E extends React.ElementType> = React.PropsWithChildren<
  React.ComponentPropsWithoutRef<E> & {
    as?: E
  }
>
