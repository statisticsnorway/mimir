import { type Request, type Response } from '@enonic-types/core'
import { query, type Content } from '/lib/xp/content'
import { pageUrl } from '/lib/xp/portal'
import {
  getAllStatisticsFromRepo,
  fetchStatisticsFromStatregAPI,
  type StatisticListingResponse,
} from '/lib/ssb/statreg/statistics'
import { type StatisticInListing } from '/lib/ssb/dashboard/statreg/types'
import { isEnabled } from '/lib/featureToggle'
import { type Statistics } from '/site/content-types'

type Lang = 'no' | 'en' | undefined
type StatisticFromApi = NonNullable<StatisticListingResponse['statistics']>[number]
type Statistic = StatisticInListing | StatisticFromApi

const useStatregApi = isEnabled('new-statreg-as-source', false, 'ssb')

function get(req: Request): Response {
  const { lang } = req.params as { lang: Lang }

  const statistics: Statistic[] = []
  if (useStatregApi) {
    const statisticsFromApi = fetchStatisticsFromStatregAPI({ start: 0, count: 1000 })

    if (statisticsFromApi) {
      if ('error' in statisticsFromApi) {
        log.error(`Error fetching statistics from Statreg API: ${statisticsFromApi.error}`)
      } else {
        statistics.push(...statisticsFromApi)
      }
    }
  } else {
    statistics.push(...getAllStatisticsFromRepo())
  }

  let body = ''
  if (lang === 'no' || !lang) {
    body += '#\n# Rewrite map for norske kortnavn pa ssb.no\n#\n'
    body += fetchAndMap('no', statistics)
  }

  if (lang === 'en' || !lang) {
    body += '\n#\n# Rewrite map for engelske kortnavn pa ssb.no\n#\n'
    body += fetchAndMap('en', statistics)
  }

  return {
    body,
    contentType: 'text/plain',
  }
}

function fetchAndMap(lang: Lang, statistics: Statistic[]): string {
  let queryString = useStatregApi ? "data.shortname LIKE '*'" : "data.statistic LIKE '*'"
  if (lang) {
    const languages = lang === 'en' ? ['en'] : ['no', 'nb', 'nn']
    queryString += ` AND language IN ('${languages.join("', '")}')`
  }

  const statisticsContent = query<Content<Statistics>>({
    contentTypes: [`${app.name}:statistics`],
    count: 9999,
    sort: 'language DESC',
    query: queryString,
  }).hits

  const shortNameMapping = statisticsContent
    .map((content) => {
      const { statistic, shortname } = content.data
      const statisticContent = statistics.find((statisticData) => {
        if (useStatregApi) {
          return !('shortName' in statisticData) && statisticData.shortname === shortname
        }
        return 'shortName' in statisticData && statisticData.id.toString() === statistic
      })

      if (!statisticContent) {
        return null
      }

      const mappedShortName = 'shortName' in statisticContent ? statisticContent.shortName : statisticContent.shortname
      if (!mappedShortName) {
        return null
      }

      return `${mappedShortName} ${pageUrl({ path: content._path })}`
    })
    .filter((mapping): mapping is string => mapping !== null)
    .join('\n')

  return shortNameMapping
}

exports.get = get
