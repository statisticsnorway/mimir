const portal = __non_webpack_require__('/lib/xp/portal')
const thymeleaf = __non_webpack_require__('/lib/thymeleaf')
// const i18nLib = __non_webpack_require__('/lib/xp/i18n')

const view = resolve('./article.html')

exports.get = function() {
  const page = portal.getContent()
  const bodyText = portal.processHtml({
    value: page.data.articleText
  })
  // const factsAbout = i18nLib.localize({
  //   key: 'factsAbout'
  // })

  log.info(JSON.stringify(page.data, null, 2))
  log.info(JSON.stringify(bodyText, null, 2))

  const model = {
    page,
    bodyText
  }
  const body = thymeleaf.render(view, model)

  return {
    body,
    contentType: 'text/html'
  }
}
