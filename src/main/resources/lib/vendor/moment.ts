import { Moment as M } from 'moment'
export type Moment = {
  moment: (
    inp?: moment.MomentInput,
    format?: moment.MomentFormatSpecification,
    language?: string,
    strict?: boolean
  ) => M
}
export const moment: Moment['moment'] = require('moment')
