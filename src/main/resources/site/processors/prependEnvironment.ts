import { type Request, type Response } from '@enonic-types/core'
import { getEnvironmentString } from '/lib/ssb/utils/utils'

exports.responseProcessor = (req: Request, res: Response) => {
  const environment = getEnvironmentString()

  if (environment) {
    // Prepend environment to title tag in head for DEV, UTV, TEST, and QA
    const headRegex = /<head>([\s\S]*?)<\/head>/
    const titleRegex = /<title>(.*?)<\/title>/

    res.body = (res.body as string).replace(headRegex, (match, headContent) => {
      const modifiedHeadContent = headContent.replace(titleRegex, (match: string, titleText: string) => {
        return match.replace(titleText, `${environment}: ${titleText}`)
      })
      return match.replace(headContent, modifiedHeadContent)
    })
  }

  return res
}
