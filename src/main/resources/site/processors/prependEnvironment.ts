import { XP_RUN_MODE } from '/lib/ssb/utils/utils'

exports.responseProcessor = (req: XP.Request, res: XP.Response) => {
  // Prepend environment to title tag in head for DEV, UTV, TEST, and QA
  const headRegex = /<head>([\s\S]*?)<\/head>/
  const titleRegex = /<title>(.*?)<\/title>/

  let environment: string = ''
  if (XP_RUN_MODE === 'DEV') {
    environment = XP_RUN_MODE
  } else {
    // XP_RUN_MODE for UTV, TEST, and QA is 'PROD', so we fetch environment from app config here
    environment = app.config && app.config['ssb.env'] ? app.config['ssb.env'].toUpperCase() : ''
  }

  if (environment) {
    res.body = (res.body as string).replace(headRegex, (match, headContent) => {
      const modifiedHeadContent = headContent.replace(titleRegex, (match: string, titleText: string) => {
        return match.replace(titleText, `${environment}: ${titleText}`)
      })
      return match.replace(headContent, modifiedHeadContent)
    })
  }

  return res
}
