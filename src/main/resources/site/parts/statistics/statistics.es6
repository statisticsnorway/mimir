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
  hasWritePermissions
} = __non_webpack_require__('/lib/ssb/permissions')

const React4xp = require('/lib/enonic/react4xp')
const moment = require('moment/min/moment-with-locales')
const util = __non_webpack_require__('/lib/util')
const {
  getPreviousReleaseStatistic, getNextReleaseStatistic
} = __non_webpack_require__('/lib/ssb/utils')
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
  const showPreviewDraft = hasWritePermissions(req, page._id)
  const paramShowDraft = req.params.showDraft
  const draftUrl = paramShowDraft ? pageUrl() : pageUrl({
    params: {
      showDraft: true
    }
  })
  const draftButtonText = paramShowDraft ? 'Vis publiserte tall' : 'Vis upubliserte tall'

  if (statistic) {
    title = page.language === 'en' && statistic.nameEN && statistic.nameEN !== null ? statistic.nameEN : statistic.name
    const variants = util.data.forceArray(statistic.variants)
    nextReleaseDate = getNextReleaseStatistic(variants)
    previousReleaseDate = getPreviousReleaseStatistic(variants)

    if (previousReleaseDate && previousReleaseDate !== '') {
      previousRelease = moment(previousReleaseDate).format('D. MMMM YYYY')
    }

    if (nextReleaseDate && nextReleaseDate !== '') {
      nextRelease = moment(nextReleaseDate).format('D. MMMM YYYY')
    }
  }

  if (page.data.statisticsKeyFigure) {
    statisticsKeyFigure = keyFigurePreview(req, page.data.statisticsKeyFigure)
  }

  if (page.data.showModifiedDate && previousReleaseDate) {
    if (moment(modifiedDate).isAfter(previousReleaseDate)) {
      changeDate = moment(modifiedDate).format('D. MMMM YYYY, HH:MM')
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
    previousRelease: paramShowDraft && showPreviewDraft ? nextRelease : previousRelease,
    nextRelease: paramShowDraft && showPreviewDraft ? phrases.notYetDetermined : nextRelease,
    modifiedDateId: modifiedDateComponent.react4xpId,
    statisticsKeyFigure: statisticsKeyFigure ? statisticsKeyFigure.body : null,
    showPreviewDraft,
    draftUrl,
    draftButtonText
  }

  let body = render(view, model)
  let pageContributions = {
    bodyEnd: statisticsKeyFigure ? statisticsKeyFigure.pageContributions.bodyEnd : []
  }

  if (changeDate) {
    body = modifiedDateComponent.renderBody({
      body,
      clientRender: true
    })

    pageContributions = modifiedDateComponent.renderPageContributions({
      pageContributions,
      clientRender: true
    })
  }

  return {
    body,
    pageContributions,
    contentType: 'text/html'
  }
}
