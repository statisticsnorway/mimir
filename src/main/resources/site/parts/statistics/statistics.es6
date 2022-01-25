import { formatDate } from '../../../lib/ssb/utils/dateUtils'

const {
  getContent, pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  getStatisticByIdFromRepo, getReleaseDatesByVariants
} = __non_webpack_require__('/lib/ssb/statreg/statistics')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  preview: keyFigurePreview
} = __non_webpack_require__('../keyFigure/keyFigure')
const {
  hasWritePermissionsAndPreview
} = __non_webpack_require__('/lib/ssb/parts/permissions')
const {
  sleep
} = __non_webpack_require__('/lib/xp/task')
const {
  currentlyWaitingForPublish
} = __non_webpack_require__('/lib/ssb/dataset/publish')
const {
  currentlyWaitingForPublish: currentlyWaitingForPublishOld
} = __non_webpack_require__('/lib/ssb/dataset/publishOld')
const util = __non_webpack_require__('/lib/util')
const {
  isEnabled
} = __non_webpack_require__('/lib/featureToggle')

const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  moment
} = __non_webpack_require__('/lib/vendor/moment')
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
  const statistic = page.data.statistic && getStatisticByIdFromRepo(page.data.statistic)
  const wait = app.config && app.config['ssb.statistics.publishWait'] ? parseInt(app.config['ssb.statistics.publishWait']) : 100
  const maxWait = app.config && app.config['ssb.statistics.publishMaxWait'] ? parseInt(app.config['ssb.statistics.publishMaxWait']) : 10000
  const newPublishJobEnabled = isEnabled('publishJob-lib-sheduler', false, 'ssb')
  const currentlyWaiting = newPublishJobEnabled ? currentlyWaitingForPublish(page) : currentlyWaitingForPublishOld(page)
  let waitedFor = 0
  while (currentlyWaiting && waitedFor < maxWait) {
    waitedFor += wait
    sleep(wait)
  }
  if (waitedFor >= maxWait) {
    log.error(`waited for more than ${maxWait}ms on publish for ${page.data.statistic}`)
  }
  let title = page.displayName
  const updated = phrases.updated + ': '
  const nextUpdate = phrases.nextUpdate + ': '
  const changed = phrases.modified + ': '
  const modifiedText = page.data.showModifiedDate ? page.data.showModifiedDate.modifiedOption.modifiedText : null
  const modifiedDate = page.data.showModifiedDate ? page.data.showModifiedDate.modifiedOption.lastModified : null
  let previousRelease = phrases.notAvailable
  let nextRelease = phrases.notYetDetermined
  let previewNextRelease = phrases.notYetDetermined
  let statisticsKeyFigure
  let changeDate
  let nextReleaseDate
  let previousReleaseDate
  const showPreviewDraft = hasWritePermissionsAndPreview(req, page._id)
  const paramShowDraft = req.params.showDraft
  const draftUrl = paramShowDraft ? pageUrl() : pageUrl({
    params: {
      showDraft: true
    }
  })
  const draftButtonText = paramShowDraft ? 'Vis publiserte tall' : 'Vis upubliserte tall'
  const language = page.language === 'en' || page.language === 'nn' ? page.language : 'nb'

  if (statistic) {
    title = page.language === 'en' && statistic.nameEN && statistic.nameEN !== null ? statistic.nameEN : statistic.name
    const variants = util.data.forceArray(statistic.variants)
    const releaseDates = getReleaseDatesByVariants(variants)
    nextReleaseDate = releaseDates.nextRelease[0]
    previousReleaseDate = releaseDates.previousRelease[0]

    if (releaseDates.nextRelease.length > 1 && releaseDates.nextRelease[1] !== '') {
      previewNextRelease = formatDate(releaseDates.nextRelease[1], 'PPP', language)
    }

    if (previousReleaseDate && previousReleaseDate !== '') {
      previousRelease = formatDate(previousReleaseDate, 'PPP', language)
    }

    if (nextReleaseDate && nextReleaseDate !== '') {
      nextRelease = formatDate(nextReleaseDate, 'PPP', language)
    }
  }

  if (page.data.statisticsKeyFigure) {
    statisticsKeyFigure = keyFigurePreview(req, page.data.statisticsKeyFigure)
  }

  if (page.data.showModifiedDate && previousReleaseDate) {
    if (moment(modifiedDate).isAfter(previousReleaseDate)) {
      changeDate = formatDate(modifiedDate, 'PPpp', language)
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
    nextRelease: paramShowDraft && showPreviewDraft ? previewNextRelease : nextRelease,
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
      body
    })

    pageContributions = modifiedDateComponent.renderPageContributions({
      pageContributions
    })
  }

  return {
    body,
    pageContributions,
    contentType: 'text/html'
  }
}
