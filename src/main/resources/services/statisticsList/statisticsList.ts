import { type Request, type Response } from '@enonic-types/core'
import '/lib/ssb/polyfills/nashorn'
import { type StatisticListingResponse, fetchStatisticsFromStatregAPI } from '/lib/ssb/statreg/statistics'
import { newCache, type Cache } from '/lib/cache'

const statisticsListCache: Cache = newCache({
  expire: 3600,
  size: 2000,
})
const statisticsListCacheKey = 'statisticsList_statreg_api'

type StatisticsList = StatisticListingResponse['statistics']
type StatisticsListResult = StatisticsList | { error: unknown }
type StatisticsListRequest = Request & {
  params?: {
    query?: string
    start?: string | number
    count?: string | number
  }
}

function hasError(result: StatisticsListResult): result is { error: unknown } {
  if (!result) return false
  return 'error' in result
}

function fetchStatisticsList(): StatisticsListResult {
  const cachedStatisticsList = statisticsListCache.getIfPresent(statisticsListCacheKey) as StatisticsList | null
  if (cachedStatisticsList) return cachedStatisticsList

  const statisticsList = fetchStatisticsFromStatregAPI({ start: 0, count: 1000 })

  if (!hasError(statisticsList)) {
    statisticsListCache.put(statisticsListCacheKey, statisticsList)
  }

  return statisticsList
}

function filterStatistics(statistics: StatisticsList | null, query: string, start: number, count: number) {
  if (!statistics?.length) return { hits: [], count: 0, total: 0 }

  const filteredStatistics =
    statistics.filter((statistic) => {
      if (!query) return true

      const shortname = statistic.shortname?.toLowerCase() || ''
      const name = statistic.name?.toLowerCase() || ''
      return shortname.includes(query) || name.includes(query)
    }) || []

  const hits = filteredStatistics.slice(start, start + count).map(({ shortname, name }) => ({
    id: shortname,
    displayName: shortname,
    description: name,
  }))

  return { hits, count: hits.length, total: filteredStatistics.length }
}

export function get(req: StatisticsListRequest): Response {
  const statistics = fetchStatisticsList()
  const query = `${req.params?.query || ''}`.toLowerCase()
  const start = parseInt(`${req.params?.start || 0}`, 10) || 0
  const count = parseInt(`${req.params?.count || 1000}`, 10) || 1000

  if (hasError(statistics)) {
    return {
      contentType: 'application/json',
      body: statistics.error as string,
      status: 400, //TODO: Fetch status from API
    }
  }

  return {
    status: 200,
    body: filterStatistics(statistics, query, start, count),
    contentType: 'application/json',
  }
}
