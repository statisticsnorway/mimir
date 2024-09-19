import { type Content, get as getContentByKey } from '/lib/xp/content'
import { getContent, pageUrl } from '/lib/xp/portal'
import { sleep } from '/lib/xp/task'
import {
  type ReleaseDatesVariant,
  type StatisticInListing,
  type VariantInListing,
} from '/lib/ssb/dashboard/statreg/types'
import { formatDate } from '/lib/ssb/utils/dateUtils'
import { isAfter } from '/lib/vendor/dateFns'
import { render as r4xpRender } from '/lib/enonic/react4xp'
import { type Phrases } from '/lib/types/language'
import { randomUnsafeString } from '/lib/ssb/utils/utils'

import { getStatisticByIdFromRepo, getReleaseDatesByVariants } from '/lib/ssb/statreg/statistics'
import { getPhrases } from '/lib/ssb/utils/language'
import { renderError } from '/lib/ssb/error/error'
import { hasWritePermissionsAndPreview } from '/lib/ssb/parts/permissions'
import { currentlyWaitingForPublish as currentlyWaitingForPublishOld } from '/lib/ssb/dataset/publishOld'
import * as util from '/lib/util'
import { type StatisticHeader } from '/lib/types/partTypes/statisticHeader'
import { type Statistics, type OmStatistikken } from '/site/content-types'

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

export function preview(req: XP.Request): XP.Response {
  return renderPart(req)
}

// eslint-disable-next-line complexity
function renderPart(req: XP.Request): XP.Response {
  const page = getContent<Content<Statistics>>()
  if (!page) throw Error('No page found')

  const phrases = getPhrases(page) as Phrases
  const wait: number =
    app.config && app.config['ssb.statistics.publishWait'] ? parseInt(app.config['ssb.statistics.publishWait']) : 100
  const maxWait: number =
    app.config && app.config['ssb.statistics.publishMaxWait']
      ? parseInt(app.config['ssb.statistics.publishMaxWait'])
      : 10000
  const currentlyWaiting: boolean = currentlyWaitingForPublishOld(page)
  let waitedFor = 0
  while (currentlyWaiting && waitedFor < maxWait) {
    waitedFor += wait
    sleep(wait)
  }
  if (waitedFor >= maxWait) {
    log.error(`waited for more than ${maxWait}ms on publish for ${page.data.statistic as string}`)
  }
  let title: string = page.displayName
  const updated: string = `${phrases.figuresUpdated}: `
  let previousRelease: string | undefined = phrases.notAvailable
  const nextUpdate: string = `${phrases.nextUpdate}: `
  const changed: string = `${phrases.modified}: `
  const statisticsAbout: string = phrases.statisticsAbout
  const modifiedText: string | undefined = page.data.showModifiedDate
    ? page.data.showModifiedDate.modifiedOption.modifiedText
    : undefined
  const modifiedDate: string | undefined = page.data.showModifiedDate
    ? page.data.showModifiedDate.modifiedOption.lastModified
    : undefined
  let nextRelease: string | undefined = phrases.notYetDetermined
  let changeDate: string | undefined
  let nextReleaseDate: string | undefined
  let previewNextRelease: string | undefined = phrases.notYetDetermined
  let previousReleaseDate: string | undefined
  const showPreviewDraft: boolean = hasWritePermissionsAndPreview(req, page._id)
  const paramShowDraft = !!req.params.showDraft
  const draftUrl: string = paramShowDraft
    ? pageUrl({
        path: page._path,
      })
    : pageUrl({
        // TODO - test this
        path: page._path,
        params: {
          showDraft: true,
        },
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

  if (page.data.showModifiedDate && previousReleaseDate && modifiedDate) {
    if (isAfter(new Date(modifiedDate), new Date(previousReleaseDate))) {
      changeDate = formatDate(modifiedDate, 'PPpp', language)
    }
  }

  const id: string = 'modifiedDate' + randomUnsafeString()
  const aboutTheStatisticsContent: Content<OmStatistikken> | null = page.data.aboutTheStatistics
    ? getContentByKey({
        key: page.data.aboutTheStatistics,
      })
    : null

  const props: StatisticHeader = {
    title,
    updated,
    nextUpdate,
    changed,
    statisticsAbout,
    changeDate,
    modifiedText,
    previousRelease: paramShowDraft && showPreviewDraft ? nextRelease : previousRelease,
    nextRelease: paramShowDraft && showPreviewDraft ? previewNextRelease : nextRelease,
    modifiedDateId: id,
    ingress: aboutTheStatisticsContent?.data.ingress || '',
    showPreviewDraft,
    draftUrl,
    draftButtonText,
  }

  return r4xpRender('site/parts/statisticHeader/statisticHeader', props, req, {
    id: 'statisticHeader',
    body: `<section class="xp-part statistic-header"></section>`,
  })
}
