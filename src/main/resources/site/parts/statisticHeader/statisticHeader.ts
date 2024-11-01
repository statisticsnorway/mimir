import { type Content, get as getContentByKey } from '/lib/xp/content'
import { getContent, pageUrl } from '/lib/xp/portal'
import { sleep } from '/lib/xp/task'
import { render as r4xpRender } from '/lib/enonic/react4xp'
import { type Phrases } from '/lib/types/language'
import { randomUnsafeString } from '/lib/ssb/utils/utils'

import { getStatisticsDates, getStatisticTitle } from '/lib/ssb/utils/statisticsUtils'
import { StatisticInListing } from '/lib/ssb/dashboard/statreg/types'

import { getStatisticByIdFromRepo } from '/lib/ssb/statreg/statistics'
import { getPhrases } from '/lib/ssb/utils/language'
import { renderError } from '/lib/ssb/error/error'
import { hasWritePermissionsAndPreview } from '/lib/ssb/parts/permissions'
import { currentlyWaitingForPublish as currentlyWaitingForPublishOld } from '/lib/ssb/dataset/publishOld'
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
  const wait: number = parseInt(app.config?.['ssb.statistics.publishWait'] ?? '100')
  const maxWait: number = parseInt(app.config?.['ssb.statistics.publishMaxWait'] ?? '10000')
  const currentlyWaiting: boolean = currentlyWaitingForPublishOld(page)
  let waitedFor = 0
  while (currentlyWaiting && waitedFor < maxWait) {
    waitedFor += wait
    sleep(wait)
  }
  if (waitedFor >= maxWait) {
    log.error(`waited for more than ${maxWait}ms on publish for ${page.data.statistic as string}`)
  }

  const statisticsAbout: string = phrases.statisticsAbout
  const showPreviewDraft: boolean = hasWritePermissionsAndPreview(req, page._id)
  const paramShowDraft = !!req.params.showDraft
  const previewButtonUrl: string = pageUrl({
    path: page._path,
    params: paramShowDraft ? undefined : { showDraft: true },
  })
  const previewButtonText: string = paramShowDraft ? 'Vis publiserte tall' : 'Vis upubliserte tall'
  const id: string = 'modifiedDate' + randomUnsafeString()
  const aboutTheStatisticsContent: Content<OmStatistikken> | null = page.data.aboutTheStatistics
    ? getContentByKey({
        key: page.data.aboutTheStatistics,
      })
    : null

  const modifiedText: string | undefined = page.data.showModifiedDate?.modifiedOption?.modifiedText

  const statistic: StatisticInListing | undefined = getStatisticByIdFromRepo(page.data.statistic)
  const title: string = getStatisticTitle(page, statistic)
  const statisticDates = getStatisticsDates(page, phrases, paramShowDraft && showPreviewDraft, statistic)

  const props: StatisticHeader = {
    title,
    updatedPhrase: phrases.updated + ': ',
    nextUpdatePhrase: phrases.nextUpdate + ': ',
    changedPhrase: phrases.modified + ': ',
    changeDate: statisticDates.changeDate,
    modifiedText,
    previousRelease: statisticDates.previousRelease,
    nextRelease: statisticDates.nextRelease,
    modifiedDateId: id,
    ingress: aboutTheStatisticsContent?.data.ingress || '',
    statisticsAbout,
    showPreviewDraft,
    previewButtonUrl,
    previewButtonText,
  }

  return r4xpRender('site/parts/statisticHeader/statisticHeader', props, req, {
    id: 'statisticHeader',
    body: `<section class="xp-part statistic-header"></section>`,
  })
}
