exports.responseProcessor = (req: XP.Request, res: XP.Response) => {
  const paramKommune: string | undefined = req.params.kommune

  if (paramKommune) {
    const headRegex = /<head>([\s\S]*?)<\/head>/
    const titleRegex = /<title>(.*?)<\/title>/

    res.body = (res.body as string).replace(headRegex, (match, headContent) => {
      const modifiedHeadContent = headContent.replace(titleRegex, (titleElement: string, titleText: string) => {
        const newTitleText = titleText.replace('Kommunefakta', `Kommunefakta ${paramKommune}`)
        return titleElement.replace(titleText, newTitleText)
      })
      return match.replace(headContent, modifiedHeadContent)
    })
  }

  return res
}
