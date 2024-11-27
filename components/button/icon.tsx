import { tw } from '@/lib'
import Button, { type ButtonProps } from '@/components/button'

type ButtonIconProps = Omit<ButtonProps, 'aria-label' | 'title'> & {
  'aria-label': string
}

const ButtonIcon: RF<ButtonIconProps> = ({ className, ...props }) => {
  return (
    <Button
      {...props}
      type={props.type ?? 'button'}
      aria-label={props['aria-label']}
      title={props['aria-label']}
      className={tw(
        'inline-flex items-center justify-center rounded-full outline-none *:pointer-events-none focus-visible:ring',
        className
      )}
    />
  )
}

export default ButtonIcon
