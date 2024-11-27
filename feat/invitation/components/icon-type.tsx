import { Activity, Cake, Heart, Merge } from 'lucide-react'
import { InvitationTypeEnum } from '@/feat/invitation/config'

type IconTypeProps = {
  type: unknown
  size?: number
}

const IconType: RFZ<IconTypeProps> = ({ type, size = 20 }) => {
  const key = type as keyof typeof colorClasses

  // prettier-ignore
  const colorClasses = {
    [InvitationTypeEnum.pernikahan]: <Heart {...{ size }} className='fill-pink-500' strokeWidth={0} />,
    [InvitationTypeEnum.rapat]: <Activity size={size - 2} />,
    [InvitationTypeEnum.reuni]: <Merge size={size - 4} />,
    // [InvitationTypeEnum.khitanan]: <Stethoscope {...{ size }} />,
    // [InvitationTypeEnum.tasyakuran]: <MessageCircleHeart {...{ size }} />,
    [InvitationTypeEnum['ulang-tahun']]: <Cake {...{ size }} strokeWidth={1.5} />,
  }

  return key in colorClasses ? colorClasses[key] : <></>
}

export default IconType
