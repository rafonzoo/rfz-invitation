import { authProviderStateChange } from '@/feat/auth/action'
import Button, { type ButtonProps } from '@/components/button'

type ButtonAuthProps = ButtonProps & {
  provider?: 'google' | 'github'
}

const ButtonAuth: RF<ButtonAuthProps> = (args) => {
  const { provider, type = 'submit', ...props } = args
  const isSignout = !provider

  return (
    <form action={authProviderStateChange}>
      {!isSignout && <input type='hidden' name='provider' value={provider} />}
      <Button {...props} type={type} />
    </form>
  )
}

export default ButtonAuth
