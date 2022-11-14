import { get, Content } from '/lib/xp/content'
import { StatbankFrameData } from '../../../site/pages/default/default'
import { MunicipalityWithCounty } from '../dataset/klass/municipalities'

const { getPhrases } = __non_webpack_require__('/lib/ssb/utils/language')
const { pageUrl, getContent } = __non_webpack_require__('/lib/xp/portal')

function addBreadcrumbs(page: Content, visitedPage: Content, breadcrumbs: Breadcrumbs = []): Breadcrumbs {
  if (page.type === 'portal:site') {
    breadcrumbs.unshift({
      text: getPhrases(visitedPage) ? getPhrases(visitedPage).home : 'Hjem',
      link: '/',
    })
  } else {
    if (page.type !== 'base:folder') {
      breadcrumbs.unshift({
        text: page.displayName,
        link: pageUrl({
          path: page._path,
        }),
      })
    }
    const parent: Content | null = get({
      key: page._path.substring(0, page._path.lastIndexOf('/')),
    })

    if (parent) {
      return addBreadcrumbs(parent, visitedPage, breadcrumbs)
    }
  }
  return breadcrumbs
}

export function getBreadcrumbs(
  page: Content,
  municipality: MunicipalityWithCounty | undefined,
  statbank: StatbankFrameData | undefined
): Breadcrumbs {
  const statbankStatisticsPage: Content | undefined = statbank && statbank.statisticsPageContent
  const breadcrumbs: Breadcrumbs = statbankStatisticsPage
    ? addBreadcrumbs(statbankStatisticsPage, statbankStatisticsPage)
    : addBreadcrumbs(page, page)

  if (getContent().language == 'en') {
    breadcrumbs.shift()
    breadcrumbs[0].text = 'Home'
  }
  if (municipality) {
    breadcrumbs.pop()
    breadcrumbs.push({
      text: municipality.displayName,
    })
  }
  // Only display the name of the statistic for those in 4.7.
  if (statbank && !statbankStatisticsPage) {
    breadcrumbs.pop()
    breadcrumbs.push({
      text: statbank.statbankStatisticsTitle,
    })
  } else if (breadcrumbs.length > 0) {
    // Remove link of last element in the breadcrumbs list for the page we're currently on
    delete breadcrumbs[breadcrumbs.length - 1].link
  }
  return breadcrumbs
}

interface BreadcrumbsData {
  text: string
  link?: string
}

export type Breadcrumbs = Array<BreadcrumbsData>
export interface BreadcrumbsUtilsLib {
  getBreadcrumbs: (
    page: Content,
    municipality: MunicipalityWithCounty | undefined,
    statbank?: StatbankFrameData | undefined
  ) => Breadcrumbs
}
