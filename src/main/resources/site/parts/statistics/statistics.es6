const {
  getContent
} = __non_webpack_require__('/lib/xp/portal')
const {
  getStatisticByIdFromRepo
} = __non_webpack_require__('/lib/repo/statreg/statistics')
const {
  getPhrases
} = __non_webpack_require__( '/lib/language')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

const moment = require('moment/min/moment-with-locales')
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
  const phrases = getPhrases(page)
  moment.locale(page.language ? page.language : 'nb')
  const statistic = page.data.statistic && getStatisticByIdFromRepo(page.data.statistic)

  let title = page.displayName
  const updated = phrases.updated + ': '
  const nextUpdate = phrases.nextUpdate + ': '
  let previousRelease = phrases.notAvailable
  let nextRelease = phrases.notYetDetermined

  if (statistic) {
    title = statistic.name

    if (statistic.variants.previousRelease && statistic.variants.previousRelease !== '') {
      previousRelease = moment(statistic.variants.previousRelease).format('DD. MMMM YYYY')
    }

    if (statistic.variants.nextRelease && statistic.variants.nextRelease !== '') {
      nextRelease =moment(statistic.variants.nextRelease).format('DD. MMMM YYYY')
    }
  }

  const model = {
    title,
    updated,
    nextUpdate,
    previousRelease,
    nextRelease
  }

  const body = render(view, model)
  return {
    body,
    contentType: 'text/html'
  }
}
