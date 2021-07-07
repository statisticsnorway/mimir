import { AlertUtilsLib } from './alertUtils'
import { UtilsLib } from './utils'

const alertUtils: AlertUtilsLib = __non_webpack_require__('/lib/ssb/utils/alertUtils')
const utils: UtilsLib = __non_webpack_require__('/lib/ssb/utils/utils')

export default {
  ...alertUtils,
  ...utils
}

export type SSBUtilsLib = AlertUtilsLib & UtilsLib
