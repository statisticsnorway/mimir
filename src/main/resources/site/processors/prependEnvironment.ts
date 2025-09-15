import { getEnvironmentString } from '/lib/ssb/utils/utils'

exports.responseProcessor = (req: XP.Request, res: XP.Response) => {
  const environment = getEnvironmentString()

  if (environment) {
    // Prepend environment to title tag in head for DEV, UTV, TEST, and QA
    const headRegex = /<head>([\s\S]*?)<\/head>/
    const titleRegex = /<title>(.*?)<\/title>/

    res.body = (res.body as string).replace(headRegex, (match, headContent) => {
      const modifiedHeadContent: string = headContent.replace(titleRegex, (match: string, titleText: string) => {
        return match.replace(titleText, `${environment}: ${titleText}`)
      })
      log.error(modifiedHeadContent.match(/<title>(.*?)<\/title>/))
      return match.replace(headContent, modifiedHeadContent)
    })
  }

  return res
}
