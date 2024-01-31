import { getBrowserSyncScript, isRunning } from '/lib/browserSync'
import { XP_RUN_MODE } from '/lib/ssb/utils/utils'

export function responseProcessor(request: XP.Request, res: XP.Response) {
  // log.info('req:%s', toStr(req));
  // log.info('res:%s', toStr(res));

  const { mode } = request

  log.info('mode:%s', mode)
  log.info('XP_RUN_MODE:%s', XP_RUN_MODE)

  if (XP_RUN_MODE === 'PROD' || mode === 'inline' || mode === 'live') {
    return res
  }

  if (!isRunning({ request })) {
    log.info('HINT: You are running Enonic XP in development mode, however, BrowserSync is not running.')
    return res
  }

  const contribution = getBrowserSyncScript({ request })

  if (!res.pageContributions.bodyEnd) {
    res.pageContributions.bodyEnd = [contribution]
  } else if (Array.isArray(res.pageContributions.bodyEnd)) {
    res.pageContributions.bodyEnd.push(contribution)
  } else {
    res.pageContributions.bodyEnd = [res.pageContributions.bodyEnd, contribution]
  }

  return res
}
