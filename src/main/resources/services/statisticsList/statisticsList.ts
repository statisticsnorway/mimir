import '/lib/ssb/polyfills/nashorn'
import { fetchStatisticsFromStatregApi } from '/lib/ssb/statreg/statistics'
import { newCache, Cache } from '/lib/cache'

const statisticsListCache: Cache = newCache({
  expire: 3600,
  size: 2000,
})
const statisticsListCacheKey = 'statisticsList_statreg_api'

function fetchStatisticsList() {
  const cachedStatisticsList = statisticsListCache.getIfPresent(statisticsListCacheKey)
  if (cachedStatisticsList) return cachedStatisticsList

  const statisticsList = fetchStatisticsFromStatregApi({ start: 0, count: 1000 })

  statisticsListCache.put(statisticsListCacheKey, statisticsList)

  return statisticsList
}

function filterStatistics(statistics, query) {
  const hits = statistics
    ?.filter((statistic) => (query ? query === statistic.shortname || query === statistic.name : true))
    .map(({ shortname, name }) => ({
      id: shortname,
      displayName: shortname,
      description: name,
    }))

  return { hits, count: hits.length, total: statistics.length }
}

export function get(req: Request) {
  const statistics = fetchStatisticsList()
  const query = req.params?.query || ''

  if (!statistics) {
    return {
      contentType: 'application/json',
      body: statistics?.error,
      status: 400, //TODO: Fetch status from API
    }
  }

  return {
    status: 200,
    body: filterStatistics(statistics, query),
    contentType: 'application/json',
  }
}
