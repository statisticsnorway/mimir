import { XP_RUN_MODE } from '/lib/ssb/utils/utils'

exports.responseProcessor = (req: XP.Request, res: XP.Response) => {
  log.info(XP_RUN_MODE)

  return res
}
