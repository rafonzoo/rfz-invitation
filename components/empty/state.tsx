import { tw } from '@/lib'

type EmptyStateProps = {
  title: React.ReactNode
  description: React.ReactNode
  className?: string
}

const EmptyState: RF<EmptyStateProps> = ({
  title,
  className,
  description,
  children,
}) => {
  return (
    <div
      className={tw(
        'empty-state absolute bottom-0 left-0 right-0 top-0 flex items-center text-center',
        className
      )}
    >
      <div className='mx-auto table'>
        <h3 className='text-lead-title-sm font-semibold'>{title}</h3>
        <p className='mt-1.5 whitespace-pre-wrap text-sm tracking-normal text-zinc-600'>
          {description}
        </p>
        {children}
      </div>
    </div>
  )
}

export default EmptyState
