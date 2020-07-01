const {
  getContent
} = __non_webpack_require__('/lib/xp/portal')
const {
  getStatisticByIdFromRepo
} = __non_webpack_require__('/lib/repo/statreg/statistics')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

const view = resolve('./statistics.html')

exports.get = (req) => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

exports.preview = (req) => renderPart(req)

const renderPart = (req) => {
  const page = getContent()
  const statistic = page.data.statistic && getStatisticByIdFromRepo(page.data.statistic)

  const model = {
    title: page.displayName,
    statistic
  }

  const body = render(view, model)
  return {
    body,
    contentType: 'text/html'
  }
}
