// Processor to add municipality name to html title for "kommunefakta" after SEO-app has modified title. The check for req.params.kommune is an easy way to check if a municipality is chosen

exports.responseProcessor = (req: XP.Request, res: XP.Response) => {
  const paramKommune: string | undefined = req.params.kommune || req.params.Kommune
  const title = req.params.pageTitle

  if (paramKommune && title) {
    const headRegex = /<head>([\s\S]*?)<\/head>/
    const titleRegex = /<title>(.*?)<\/title>/

    res.body = (res.body as string).replace(headRegex, (match, headContent) => {
      const modifiedHeadContent = headContent.replace(titleRegex, (titleElement: string, titleText: string) => {
        const newTitleText = titleText.replace('Kommunefakta', title)
        return titleElement.replace(titleText, newTitleText)
      })
      return match.replace(headContent, modifiedHeadContent)
    })
  }

  return res
}
