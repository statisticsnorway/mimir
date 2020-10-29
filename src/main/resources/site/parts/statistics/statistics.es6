const {
  getContent, pageUrl
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
const {
  hasRole
} = __non_webpack_require__('/lib/xp/auth')

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
  let nextReleaseDate
  let previousReleaseDate
  const adminRole = hasRole('system.admin')
  const showPreviewDraft = adminRole && req.mode === 'preview'
  const paramShowDraft = req.params.showDraft
  const draftUrl = paramShowDraft ? pageUrl() : pageUrl({
    params: {
      showDraft: true
    }
  })
  const draftButtonText = paramShowDraft ? 'Vis publiserte tall' : 'Vis upubliserte tall'

  if (statistic) {
    title = statistic.name
    const variants = util.data.forceArray(statistic.variants)
    nextReleaseDate = getNextRelease(variants)
    previousReleaseDate = getPreviousRelease(variants)

    if (previousReleaseDate && previousReleaseDate !== '') {
      previousRelease = moment(previousReleaseDate).format('DD. MMMM YYYY')
    }

    if (nextReleaseDate && nextReleaseDate !== '') {
      nextRelease = moment(nextReleaseDate).format('DD. MMMM YYYY')
    }
  }

  if (page.data.statisticsKeyFigure) {
    statisticsKeyFigure = keyFigurePreview(req, page.data.statisticsKeyFigure)
  }

  if (page.data.showModifiedDate && previousReleaseDate) {
    if (moment(modifiedDate).isAfter(previousReleaseDate)) {
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
    statisticsKeyFigure: statisticsKeyFigure ? statisticsKeyFigure.body : null,
    showPreviewDraft,
    draftUrl,
    draftButtonText
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

const getNextRelease = (variants) => {
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
  return variants.length > 1 ? sortedVariants[0].nextRelease : variants.nextRelease
}

const getPreviousRelease = (variants) => {
  let sortedVariants = []
  if (variants.length > 1) {
    sortedVariants = variants.sort((a, b) => {
      const dateA = a.previousRelease ? new Date(a.previousRelease) : ''
      const dateB = b.previousRelease ? new Date(b.previousRelease) : ''
      if (dateA < dateB) {
        return 1
      } else if (dateA > dateB) {
        return -1
      } else {
        return 0
      }
    })
  }
  return variants.length > 1 ? sortedVariants[0].previousRelease : variants.previousRelease
}
