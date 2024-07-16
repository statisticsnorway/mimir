import { XP_RUN_MODE } from '/lib/ssb/utils/utils'

exports.responseProcessor = (req: XP.Request, res: XP.Response) => {
  log.info(`in ${XP_RUN_MODE} mode`)
  if (XP_RUN_MODE === 'PROD') return res // TODO: It's possible UTV, TEST, and QA have RunMode PROD

  // Prepend environment to title tag in head for DEV, UTV, TEST, and QA
  const headRegex = /<head>([\s\S]*?)<\/head>/
  const titleRegex = /<title>(.*?)<\/title>/

  // TODO: XP_RUN_MODE only returns DEV or PROD. Consider using baseUrl?
  // const baseUrl = app.config && app.config['ssb.baseUrl']
  res.body = (res.body as string).replace(headRegex, (match, headContent) => {
    const modifiedHeadContent = headContent.replace(titleRegex, (match: string, titleText: string) => {
      return match.replace(titleText, `${XP_RUN_MODE}: ${titleText}`)
    })
    return match.replace(headContent, modifiedHeadContent)
  })
  return res
}
