// Processor to add municipality name to html title for "kommunefakta" after SEO-app has modified title

exports.responseProcessor = (req: XP.Request, res: XP.Response) => {
  const paramKommune: string | undefined = req.params.kommune
  const kommune = paramKommune
    ?.split('-')
    .map((kommuneVariants) => kommuneVariants.charAt(0).toUpperCase() + kommuneVariants.slice(1))
    .join('-')

  if (paramKommune) {
    const headRegex = /<head>([\s\S]*?)<\/head>/
    const titleRegex = /<title>(.*?)<\/title>/

    res.body = (res.body as string).replace(headRegex, (match, headContent) => {
      const modifiedHeadContent = headContent.replace(titleRegex, (titleElement: string, titleText: string) => {
        const newTitleText = titleText.replace('Kommunefakta', `Kommunefakta ${kommune}`)
        return titleElement.replace(titleText, newTitleText)
      })
      return match.replace(headContent, modifiedHeadContent)
    })
  }

  return res
}
