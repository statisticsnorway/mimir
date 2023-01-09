import { render, type RenderResponse } from '/lib/enonic/react4xp'
import { type Content } from '/lib/xp/content'
import type { Component } from '/lib/xp/portal'
import type { YearReleases } from '../../../lib/ssb/utils/variantUtils'
import type { UpcomingReleases as UpcomingReleasesPartConfig } from '.'
import { getContent, getComponent, processHtml, serviceUrl } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { getUpcomingReleasesResults } from '/lib/ssb/parts/upcomingReleases'

const { addMonthNames, groupStatisticsByYearMonthAndDay } = __non_webpack_require__('/lib/ssb/utils/variantUtils')
const { fromPartCache } = __non_webpack_require__('/lib/ssb/cache/partCache')

export function get(req: XP.Request): RenderResponse {
  return renderPart(req)
}

export function preview(req: XP.Request): RenderResponse {
  return renderPart(req)
}

function renderPart(req: XP.Request): RenderResponse {
  const content: Content = getContent()
  const component: Component<UpcomingReleasesPartConfig> = getComponent()
  const currentLanguage: string = content.language ? content.language : 'nb'
  const count: number = parseInt(component.config.numberOfDays)
  const buttonTitle: string = localize({
    key: 'button.showAll',
    locale: currentLanguage,
  })
  const statisticsPageUrlText: string = localize({
    key: 'upcomingReleases.statisticsPageText',
    locale: currentLanguage,
  })
  const upcomingReleasesServiceUrl: string = serviceUrl({
    service: 'upcomingReleases',
  })

  const groupedWithMonthNames: Array<YearReleases> = fromPartCache(req, `${content._id}-upcomingReleases`, () => {
    const upcomingReleases = getUpcomingReleasesResults(req, count, currentLanguage).upcomingReleases

    const groupedByYearMonthAndDay = groupStatisticsByYearMonthAndDay(upcomingReleases)

    return addMonthNames(groupedByYearMonthAndDay, currentLanguage)
  })

  const props: PartProps = {
    title: content.displayName,
    releases: groupedWithMonthNames,
    preface: component.config.preface
      ? processHtml({
          value: component.config.preface,
        })
      : undefined,
    language: currentLanguage,
    count,
    upcomingReleasesServiceUrl,
    buttonTitle,
    statisticsPageUrlText,
  }

  return render('site/parts/upcomingReleases/upcomingReleases', props, req)
}

interface PartProps {
  releases: Array<YearReleases>
  title?: string
  preface?: string
  language: string
  count: number
  upcomingReleasesServiceUrl: string
  buttonTitle: string
  statisticsPageUrlText: string
}
