import { type Request, type Response } from '@enonic-types/core'
import { type Content } from '/lib/xp/content'
import { getContent, pageUrl } from '/lib/xp/portal'
import { sleep } from '/lib/xp/task'
import { render } from '/lib/thymeleaf'
import { type StatisticInListing } from '/lib/ssb/dashboard/statreg/types'
import { render as r4xpRender } from '/lib/enonic/react4xp'
import { type Phrases } from '/lib/types/language'
import { randomUnsafeString } from '/lib/ssb/utils/utils'

import { getStatisticByIdFromRepo } from '/lib/ssb/statreg/statistics'
import { getPhrases } from '/lib/ssb/utils/language'
import { renderError } from '/lib/ssb/error/error'
import { hasWritePermissionsAndPreview } from '/lib/ssb/parts/permissions'
import { currentlyWaitingForPublish as currentlyWaitingForPublishOld } from '/lib/ssb/dataset/publishOld'
import { type StatisticsProps } from '/lib/types/partTypes/statistics'
import { isEnabled } from '/lib/types/featureToggle'
import { getStatisticsDates } from '/lib/ssb/utils/statisticsUtils'
import { type Statistics } from '/site/content-types'
import { preview as keyFigurePreview } from '/site/parts/keyFigure/keyFigure'

const view = resolve('./statistics.html')

export function get(req: Request): Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e as Error)
  }
}

export function preview(req: Request): Response {
  return renderPart(req)
}

// eslint-disable-next-line complexity
function renderPart(req: Request): Response {
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
  const updated: string = phrases.updated + ': '
  const nextUpdate: string = phrases.nextUpdate + ': '
  const changed: string = phrases.modified + ': '
  const modifiedText: string | undefined = page.data.showModifiedDate
    ? page.data.showModifiedDate.modifiedOption.modifiedText
    : undefined
  let statisticsKeyFigure: Response | undefined
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

  const statregAPI = isEnabled('new-statreg-as-source', false, 'ssb')
  const statistic: StatisticInListing | undefined = getStatisticByIdFromRepo(page.data.statistic)
  const statisticDates = getStatisticsDates(page, phrases, paramShowDraft && showPreviewDraft, statistic, statregAPI)
  const changeDate = statisticDates.changeDate

  // Preserve the existing StatReg API behavior where the page title comes from the content item.
  // Only override it from the repo-backed statistic in the legacy path.
  let title: string = page.displayName
  if (statistic && !statregAPI) {
    title = page.language === 'en' && statistic.nameEN && statistic.nameEN !== null ? statistic.nameEN : statistic.name
  }

  if (page.data.statisticsKeyFigure) {
    statisticsKeyFigure = keyFigurePreview(req, page.data.statisticsKeyFigure)
  }

  const id: string = 'modifiedDate' + randomUnsafeString()

  const model: StatisticsProps = {
    title,
    updated,
    nextUpdate,
    changed,
    changeDate,
    modifiedText,
    previousRelease: statisticDates.previousRelease,
    nextRelease: statisticDates.nextRelease,
    modifiedDateId: id,
    statisticsKeyFigure: (statisticsKeyFigure?.body as string | undefined) || null,
    showPreviewDraft,
    draftUrl,
    draftButtonText,
  }

  const body: string = render(view, model)
  const pageContributions: XP.PageContributions = {
    bodyEnd:
      statisticsKeyFigure && statisticsKeyFigure.pageContributions ? statisticsKeyFigure.pageContributions.bodyEnd : [],
  }

  if (changeDate) {
    return r4xpRender(
      'ModifiedDate',
      {
        explanation: modifiedText,
        children: changeDate,
      },
      req,
      {
        id: id,
        body: body,
        pageContributions,
        ssr: req.mode === 'edit', // Component has to be clientside rendered so it doesn't get inserted twice
      }
    )
  }

  return {
    body,
    pageContributions,
    contentType: 'text/html',
  }
}
