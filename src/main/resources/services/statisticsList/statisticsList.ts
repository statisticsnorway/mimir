import { type Request, type Response } from '@enonic-types/core'
import '/lib/ssb/polyfills/nashorn'
import { type StatisticListingResponse, fetchStatisticsFromStatregAPI } from '/lib/ssb/statreg/statistics'
import { fromStatisticsListCache } from '/lib/ssb/cache/cache'
import { forceArray } from '/lib/ssb/utils/arrayUtils'

type StatisticsList = StatisticListingResponse['statistics']
type StatisticsListRequest = Request & {
  params?: {
    query?: string
    ids?: string[]
    start?: number
    count?: number
  }
}

function filterStatistics(
  statistics: StatisticsList | null,
  query: string,
  ids: string[],
  start: number,
  count: number
) {
  if (!statistics?.length) return { hits: [], count: 0, total: 0 }

  const selectedHits = statistics
    .filter((statistic) => ids.includes(statistic.shortname || ''))
    .map(({ shortname, name }) => ({
      id: shortname,
      displayName: shortname,
      description: name,
    }))

  const filteredStatistics =
    statistics.filter((statistic) => {
      if (!query) return true

      const shortname = statistic.shortname || ''
      const name = statistic.name?.toLowerCase() || ''
      return shortname.includes(query) || name.includes(query)
    }) || []

  const pagedHits = filteredStatistics.slice(start, start + count).map(({ shortname, name }) => ({
    id: shortname,
    displayName: shortname,
    description: name,
  }))

  const hits = [...selectedHits, ...pagedHits].filter(
    (hit, index, allHits) => allHits.findIndex((candidate) => candidate.id === hit.id) === index
  )

  return { hits, count: hits.length, total: filteredStatistics.length }
}

export function get(req: StatisticsListRequest): Response {
  const query = req.params?.query ? req.params.query.toLowerCase() : ''
  const ids = req.params?.ids ? forceArray(req.params.ids) : []
  const start = req.params?.start ? req.params.start : 0
  const count = req.params?.count ? req.params.count : 1000

  const statistics = fromStatisticsListCache('statregAPI_statisticsListing', () =>
    fetchStatisticsFromStatregAPI({ start: 0, count: 1000 })
  )

  if (statistics && 'error' in statistics) {
    return {
      status: 400,
      body: statistics.error as string,
      contentType: 'application/json',
    }
  }

  return {
    status: 200,
    body: filterStatistics(statistics, query, ids, start, count),
    contentType: 'application/json',
  }
}
