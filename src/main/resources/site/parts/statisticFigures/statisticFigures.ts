import { type Content } from '/lib/xp/content'
import { getContent, processHtml, assetUrl } from '/lib/xp/portal'
import { type Phrases } from '/lib/types/language'
import { render as r4XpRender } from '/lib/enonic/react4xp'
import { type StatisticInListing } from '/lib/ssb/dashboard/statreg/types'
import { getStatisticByIdFromRepo } from '/lib/ssb/statreg/statistics'
import { getTablesAndFigures, getFinalPageContributions } from '/lib/ssb/parts/attachmentTablesFigures'
import { type AttachmentTablesFiguresData } from '/lib/types/partTypes/attachmentTablesFigures'
import { ensureArray } from '/lib/ssb/utils/arrayUtils'
import { getPhrases } from '/lib/ssb/utils/language'
import { renderError } from '/lib/ssb/error/error'
import { type StatisticFiguresProps } from '/lib/types/partTypes/statisticFigures'
import { type Statistics } from '/site/content-types'

const STATBANKWEB_URL: string = app.config?.['ssb.statbankweb.baseUrl'] ?? 'https://www.ssb.no/statbank'

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request): XP.Response {
  return renderPart(req)
}

function renderPart(req: XP.Request): XP.Response {
  const page = getContent<Content<Statistics>>()
  if (!page) throw Error('No page found')

  const phrases: Phrases = getPhrases(page) as Phrases
  const attachmentTablesAndFigures: Array<string> = page.data.attachmentTablesFigures
    ? ensureArray(page.data.attachmentTablesFigures)
    : []

  if (page.data.mainTable) {
    attachmentTablesAndFigures.unshift(page.data.mainTable)
  }
  const attachmentTableAndFigureView: Array<AttachmentTablesFiguresData> = getTablesAndFigures(
    attachmentTablesAndFigures,
    req,
    phrases
  )
  const StatisticFiguresProps: StatisticFiguresProps = getStatisticFiguresProps(
    attachmentTableAndFigureView,
    page,
    phrases
  )

  const statisticFiguresComponent = r4XpRender('StatisticFigures', StatisticFiguresProps, req, {
    id: 'figures',
    body: `<section class="xp-part statistic-figures"></section>`,
  })

  const statisticFiguresBody: string | null = statisticFiguresComponent.body
  const statisticFiguresPageContributions: XP.PageContributions = statisticFiguresComponent.pageContributions
  const pageContributions: XP.PageContributions | null = getFinalPageContributions(
    statisticFiguresPageContributions,
    attachmentTableAndFigureView
  )

  if (!attachmentTablesAndFigures.length && !(req.mode === 'edit' && page.type !== `${app.name}:statistics`)) {
    return {
      body: null,
    }
  } else {
    return {
      body: statisticFiguresBody,
      pageContributions,
      contentType: 'text/html',
    }
  }
}

function getStatisticFiguresProps(
  attachmentTableAndFigureView: Array<AttachmentTablesFiguresData>,
  page: Content<Statistics>,
  phrases: Phrases
): StatisticFiguresProps {
  const title: string = phrases.attachmentTablesFigures
  const statistic: StatisticInListing | undefined = (page.data.statistic &&
    getStatisticByIdFromRepo(page.data.statistic)) as StatisticInListing | undefined
  const shortName: string | undefined = statistic && statistic.shortName ? statistic.shortName : undefined

  return {
    accordions: attachmentTableAndFigureView.map(({ id, open, subHeader, body, contentType, props }) => {
      return {
        id,
        contentType,
        open,
        subHeader,
        body,
        props,
      }
    }),
    freeText: page.data.freeTextAttachmentTablesFigures
      ? processHtml({
          value: page.data.freeTextAttachmentTablesFigures.replace(/&nbsp;/g, ' '),
        })
      : undefined,
    showAll: phrases.showAll,
    showLess: phrases.showLess,
    selectedFigures: phrases.statisticSelectedFigures,
    statbankBoxTitle: phrases.statisticStatbankBoxTitle,
    statbankBoxText: phrases.statisticStatbankBoxText,
    appName: app.name,
    title,
    icon: assetUrl({
      path: 'SSB_ikon_statisticFigures.svg',
    }),
    iconStatbankBox: assetUrl({
      path: 'SSB_ikon_statbank.svg',
    }),
    statbankHref: `${STATBANKWEB_URL}/list/${shortName}`,
  }
}
