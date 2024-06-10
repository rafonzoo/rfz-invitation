type RC = Readonly<{ children?: React.ReactNode }>

type RF<T = {}> = React.FC<RC & T>
