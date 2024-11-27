import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'
import customFormat from 'dayjs/plugin/customParseFormat'
import 'dayjs/locale/id'

dayjs.extend(utc)
dayjs.extend(customFormat)
dayjs.extend(relativeTime)
dayjs.locale('id')
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Jakarta')

const DayJS = dayjs

export { DayJS as default }
