import { tw } from '@/lib'

type ListGroupProps = Omit<TAG<'div'>, 'title'> & {
  title?: React.ReactNode
  titleClasses?: string
  info?: React.ReactNode
  infoClasses?: string
  rootClasses?: string
  afterTitle?: React.ReactNode
  disablePeerList?: boolean
}

const ListGroup: RF<ListGroupProps> = ({
  title,
  titleClasses,
  info,
  infoClasses,
  rootClasses,
  afterTitle,
  disablePeerList = false,
  ...props
}) => {
  return (
    <div
      className={tw(
        'peer/list relative',
        !disablePeerList && 'peer-[]/list:mt-8',
        rootClasses
      )}
    >
      {typeof title === 'string' ? (
        <h3
          className={tw(
            // '[.list:has(>p)_+_.list_&]:-mt-5', // EXPERIMENTAL
            'mb-1.5 ml-4 text-sm font-semibold tracking-normal',
            titleClasses
          )}
        >
          {title}
        </h3>
      ) : (
        title
      )}
      {afterTitle}
      <div
        {...props}
        className={tw(
          'divide-y overflow-hidden rounded-field bg-white',
          props.className
        )}
      >
        {props.children}
      </div>
      {!!info && (
        <p
          className={tw(
            'mx-4 mt-1.5 pb-2 text-xs tracking-base text-zinc-500',
            infoClasses
          )}
        >
          {info}
        </p>
      )}
    </div>
  )
}

export default ListGroup
