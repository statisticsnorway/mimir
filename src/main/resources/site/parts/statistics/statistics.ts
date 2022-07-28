import { Content } from 'enonic-types/content'
import { ResourceKey, render } from 'enonic-types/thymeleaf'
import { ReleaseDatesVariant, StatisticInListing, VariantInListing } from '../../../lib/ssb/dashboard/statreg/types'
import { formatDate } from '../../../lib/ssb/utils/dateUtils'
import { React4xp, React4xpObject, React4xpPageContributionOptions } from '../../../lib/types/react4xp'
import { Statistics } from '../../content-types/statistics/statistics'
import { Phrases } from '../../../lib/types/language'

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

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  moment
} = __non_webpack_require__('/lib/vendor/moment')
const view: ResourceKey = resolve('./statistics.html')

exports.get = (req: XP.Request): XP.Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

exports.preview = (req: XP.Request): XP.Response => renderPart(req)

function renderPart(req: XP.Request): XP.Response {
  const page: Content<Statistics> = getContent()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const phrases: Phrases = getPhrases(page)
  const wait: number = app.config && app.config['ssb.statistics.publishWait'] ? parseInt(app.config['ssb.statistics.publishWait']) : 100
  const maxWait: number = app.config && app.config['ssb.statistics.publishMaxWait'] ? parseInt(app.config['ssb.statistics.publishMaxWait']) : 10000
  const newPublishJobEnabled: boolean = isEnabled('publishJob-lib-sheduler', false, 'ssb')
  const currentlyWaiting: boolean = newPublishJobEnabled ? currentlyWaitingForPublish(page) : currentlyWaitingForPublishOld(page)
  let waitedFor: number = 0
  while (currentlyWaiting && waitedFor < maxWait) {
    waitedFor += wait
    sleep(wait)
  }
  if (waitedFor >= maxWait) {
    log.error(`waited for more than ${maxWait}ms on publish for ${page.data.statistic as string}`)
  }
  let title: string = page.displayName
  const updated: string = phrases.updated + ': '
  const nextUpdate: string = phrases.nextUpdate + ': '
  const changed: string = phrases.modified + ': '
  const modifiedText: string | undefined = page.data.showModifiedDate ? page.data.showModifiedDate.modifiedOption.modifiedText : undefined
  const modifiedDate: string | undefined = page.data.showModifiedDate ? page.data.showModifiedDate.modifiedOption.lastModified : undefined
  let previousRelease: string | undefined = phrases.notAvailable
  let nextRelease: string | undefined = phrases.notYetDetermined
  let previewNextRelease: string | undefined = phrases.notYetDetermined
  let statisticsKeyFigure: XP.Response | undefined
  let changeDate: string | undefined
  let nextReleaseDate: string | undefined
  let previousReleaseDate: string | undefined
  const showPreviewDraft: boolean = hasWritePermissionsAndPreview(req, page._id)
  const paramShowDraft: boolean = !!req.params.showDraft
  const draftUrl: string = paramShowDraft ? pageUrl({
    path: page._path
  }) : pageUrl({
    params: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      showDraft: true
    }
  })
  const draftButtonText: string = paramShowDraft ? 'Vis publiserte tall' : 'Vis upubliserte tall'
  const language: string = page.language === 'en' || page.language === 'nn' ? page.language : 'nb'

  const statistic: StatisticInListing | undefined = getStatisticByIdFromRepo(page.data.statistic)
  if (statistic) {
    title = page.language === 'en' && statistic.nameEN && statistic.nameEN !== null ? statistic.nameEN : statistic.name
    const variants: Array<VariantInListing | undefined> = util.data.forceArray(statistic.variants)
    const releaseDates: ReleaseDatesVariant = getReleaseDatesByVariants(variants as Array<VariantInListing>)
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

  const modifiedDateComponent: React4xpObject = new React4xp('ModifiedDate')
    .setProps({
      explanation: modifiedText,
      className: '',
      children: changeDate
    })
    .setId('modifiedDate')
    .uniqueId()

  const model: StatisticsProps = {
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

  let body: string = render(view, model)
  let pageContributions: XP.PageContributions = {
    bodyEnd: statisticsKeyFigure && statisticsKeyFigure.pageContributions ? statisticsKeyFigure.pageContributions.bodyEnd : []
  }

  if (changeDate) {
    body = modifiedDateComponent.renderBody({
      body
    })

    pageContributions = modifiedDateComponent.renderPageContributions({
      pageContributions: pageContributions as React4xpPageContributionOptions
    }) as XP.PageContributions
  }

  return {
    body,
    pageContributions,
    contentType: 'text/html'
  }
}


interface StatisticsProps {
  title: string;
  updated: string;
  nextUpdate: string;
  changed: string
  changeDate: string | undefined;
  modifiedText: string | null | undefined;
  previousRelease: string | undefined;
  nextRelease: string | undefined;
  modifiedDateId: string;
  statisticsKeyFigure: string | object | null | undefined;
  showPreviewDraft: boolean;
  draftUrl: string;
  draftButtonText: string;
}
