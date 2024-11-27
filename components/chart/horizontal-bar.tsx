import { tw } from '@/lib'

type ChartBarProps = {
  data: {
    value: number
    primary?: boolean
    label?: React.ReactNode
    className?: string
  }[]
  units?: string
  title?: string
  titlePrefix?: React.ReactNode
  description?: string
  withHighest?: boolean
  total?: number
}

const ChartHorizontalBar: RFZ<ChartBarProps> = ({
  data,
  units,
  title,
  titlePrefix,
  description,
  withHighest,
  total: _total,
}) => {
  const total = _total ?? data.reduce((acc, val) => acc + val.value, 0)
  const highest = Math.max.apply(
    null,
    data.map((item) => item.value)
  )

  return (
    <div className='relative rounded-field bg-white p-4'>
      {title && (
        <div className='flex items-center'>
          {titlePrefix && <span className='mr-1.5 block'>{titlePrefix}</span>}
          <p className='text-sm font-semibold tracking-normal'>{title}</p>
        </div>
      )}
      {description && (
        <div className='mt-2 text-sm font-semibold tracking-normal'>
          {description}
        </div>
      )}
      <ul className='mt-4 flex h-full flex-col flex-nowrap space-y-3'>
        {data
          .sort((a, b) => (b.primary ? 1 : 0) - (a.primary ? 1 : 0))
          .map(({ value, label, className }, index) => (
            <li key={index}>
              <p className='mb-0.5 flex items-end text-large-title-sm font-semibold'>
                {value}
                {units && (
                  <span className='ml-0.5 block text-sm opacity-40'>
                    {units}
                  </span>
                )}
              </p>
              <div
                style={{ width: `${(value / (withHighest ? highest : total)) * 100}%` }} // prettier-ignore
                className={tw(
                  'inline-flex h-6 min-w-fit max-w-full items-center rounded bg-zinc-200 px-1.5 text-xs font-semibold uppercase tracking-normal',
                  className
                )}
              >
                {label}
              </div>
            </li>
          ))}
      </ul>
    </div>
  )
}

export default ChartHorizontalBar
