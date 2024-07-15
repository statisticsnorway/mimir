import { XP_RUN_MODE } from '/lib/ssb/utils/utils'

exports.responseProcessor = (req: XP.Request, res: XP.Response) => {
  if (XP_RUN_MODE === 'PROD') return res

  // Prepend environment to title tag in head for DEV, UTV, TEST, and QA
  const headRegex = /<head>([\s\S]*?)<\/head>/
  const titleRegex = /<title>(.*?)<\/title>/

  // TODO: XP_RUN_MODE only returns DEV, TEST or PROD
  res.body = (res.body as string).replace(headRegex, (match, headContent) => {
    const modifiedHeadContent = headContent.replace(titleRegex, (match: string, titleText: string) => {
      return match.replace(titleText, `${XP_RUN_MODE}: ${titleText}`)
    })
    return match.replace(headContent, modifiedHeadContent)
  })
  return res
}
