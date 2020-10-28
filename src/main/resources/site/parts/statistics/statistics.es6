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
const {
  preview: keyFigurePreview
} = __non_webpack_require__('../keyFigure/keyFigure')

const React4xp = require('/lib/enonic/react4xp')
const moment = require('moment/min/moment-with-locales')
const util = __non_webpack_require__('/lib/util')
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
  const changed = phrases.modified + ': '
  const modifiedText = page.data.showModifiedDate ? page.data.showModifiedDate.modifiedOption.modifiedText : null
  const modifiedDate = page.data.showModifiedDate ? page.data.showModifiedDate.modifiedOption.lastModified : null
  let previousRelease = phrases.notAvailable
  let nextRelease = phrases.notYetDetermined
  let statisticsKeyFigure
  let changeDate

  if (statistic) {
    title = statistic.name
    const variants = util.data.forceArray(statistic.variants)
    let sortedVariants = []
    if (variants.length > 1) {
      sortedVariants = variants.sort((a, b) => {
        const dateA = a.nextRelease ? new Date(a.nextRelease) : ''
        const dateB = b.nextRelease ? new Date(b.nextRelease) : ''
        if (dateA < dateB) {
          return -1
        } else if (dateA > dateB) {
          return 1
        } else {
          return 0
        }
      })
    }

    const variant = variants.length > 1 ? sortedVariants[0] : statistic.variants

    if (variant.previousRelease && variant.previousRelease !== '') {
      previousRelease = moment(variant.previousRelease).format('DD. MMMM YYYY')
    }

    if (variant.nextRelease && variant.nextRelease !== '') {
      nextRelease = moment(variant.nextRelease).format('DD. MMMM YYYY')
    }
  }

  if (page.data.statisticsKeyFigure) {
    statisticsKeyFigure = keyFigurePreview(req, page.data.statisticsKeyFigure)
  }

  if (page.data.showModifiedDate && variant.previousRelease) {
    if (moment(modifiedDate).isAfter(variant.previousRelease)) {
      changeDate = moment(modifiedDate).format('DD. MMMM YYYY, HH:MM')
    }
  }

  const modifiedDateComponent = new React4xp('ModifiedDate')
    .setProps({
      explanation: modifiedText,
      className: '',
      children: changeDate
    })
    .setId('modifiedDate')
    .uniqueId()

  const model = {
    title,
    updated,
    nextUpdate,
    changed,
    changeDate,
    modifiedText,
    previousRelease,
    nextRelease,
    modifiedDateId: modifiedDateComponent.react4xpId,
    statisticsKeyFigure: statisticsKeyFigure ? statisticsKeyFigure.body : null
  }

  let body = render(view, model)
  if (changeDate) {
    body = modifiedDateComponent.renderBody({
      body
    })
  }
  const pageContributions = modifiedDateComponent.renderPageContributions({
    pageContributions: {
      bodyEnd: statisticsKeyFigure ? statisticsKeyFigure.pageContributions.bodyEnd : []
    },
    clientRender: true
  })
  return {
    body,
    pageContributions,
    contentType: 'text/html'
  }
}
