import { get as getContentByKey, type Content } from '/lib/xp/content'
import { getContent, assetUrl } from '/lib/xp/portal'
import { getNextRelease, getAccordionData } from '/lib/ssb/parts/statisticDescription'
import { type StatisticInListing } from '/lib/ssb/dashboard/statreg/types'
import { type Phrases } from '/lib/types/language'
import { render } from '/lib/enonic/react4xp'
import { formatDate } from '/lib/ssb/utils/dateUtils'

import { renderError } from '/lib/ssb/error/error'
import { getStatisticByIdFromRepo } from '/lib/ssb/statreg/statistics'
import { getPhrases } from '/lib/ssb/utils/language'
import { fromPartCache } from '/lib/ssb/cache/partCache'
import { type StatisticDescriptionProps } from '/lib/types/partTypes/statisticDescription'

import { type Statistics, type OmStatistikken } from '/site/content-types'

export function get(req: XP.Request): XP.Response {
  try {
    const statisticPage = getContent<Content<Statistics>>()
    if (!statisticPage) throw Error('No page found')

    return renderPart(req, statisticPage.data.aboutTheStatistics)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request, id: string | undefined): XP.Response {
  return renderPart(req, id)
}

function renderPart(req: XP.Request, aboutTheStatisticsId: string | undefined): XP.Response {
  const page = getContent()
  if (!page) throw Error('No page found')

  if (!aboutTheStatisticsId) {
    if (req.mode === 'edit' && page.type !== `${app.name}:statistics`) {
      return render(
        'site/parts/statisticDescription/statisticDescription',
        {
          accordions: [],
          label: 'Om statistikken',
          ingress: '',
        },
        req,
        {
          body: `<section id="om-statistikken" class="xp-part part-om-statistikken container-fluid"></section>`,
          id: 'om-statistikken',
        }
      )
    } else {
      return {
        body: null,
      }
    }
  } else {
    if (req.mode === 'edit' || req.mode === 'inline' || req.mode === 'preview') {
      return getOmStatistikken(req, page, aboutTheStatisticsId)
    } else {
      return fromPartCache(req, `${page._id}-omStatistikken`, () => {
        return getOmStatistikken(req, page, aboutTheStatisticsId)
      })
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getOmStatistikken(req: XP.Request, page: Content<any>, aboutTheStatisticsId: string | undefined): XP.Response {
  const phrases: Phrases = getPhrases(page) as Phrases
  const language: string = page.language === 'en' || page.language === 'nn' ? page.language : 'nb'
  let nextRelease: string = phrases.notYetDetermined
  const statisticPage = getContent<Content<Statistics>>()
  if (!statisticPage) throw Error('No page found')

  const statisticId: string | undefined = statisticPage.data.statistic

  const aboutTheStatisticsContent: Content<OmStatistikken> | null = aboutTheStatisticsId
    ? getContentByKey({
        key: aboutTheStatisticsId,
      })
    : null

  const statistic: StatisticInListing | undefined = statisticId ? getStatisticByIdFromRepo(statisticId) : undefined

  if (statistic) {
    nextRelease = getNextRelease(statistic, nextRelease, language)
  }

  if (page.type === `${app.name}:omStatistikken` && (req.mode === 'edit' || req.mode === 'preview')) {
    // Kun ment for internt bruk, i forhåndsvisning av om-statistikken.
    nextRelease = '<i>Kan kun vises på statistikksiden, ikke i forhåndsvisning av om-statistikken</i>'
  }

  const aboutTheStatisticsData: OmStatistikken | undefined = aboutTheStatisticsContent?.data
  const lastUpdated: string | undefined = formatDate(aboutTheStatisticsContent?.modifiedTime, 'PPP', language)

  const props: StatisticDescriptionProps = {
    accordions: aboutTheStatisticsData ? getAccordionData(aboutTheStatisticsData, phrases, nextRelease) : [],
    label: phrases.aboutTheStatistics,
    icon: assetUrl({
      path: 'SSB_ikon_statisticDescription.svg',
    }),
    ingress: aboutTheStatisticsData?.ingress ?? '',
    lastUpdatedPhrase: phrases.lastUpdated,
    lastUpdated: lastUpdated ?? '',
  }

  return render('site/parts/statisticDescription/statisticDescription', props, req, {
    // for now, this needs to be a section, so we get correct spacing between parts
    body: `<section id="om-statistikken" class="xp-part statistic-description container-fluid"></section>`,
    id: 'statistic-description',
  })
}
