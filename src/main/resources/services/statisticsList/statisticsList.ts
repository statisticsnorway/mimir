import '/lib/ssb/polyfills/nashorn'
import { fetchStatisticsFromStatregApi } from '/lib/ssb/statreg/statistics'

function filterStatisticsByName(statistics, query) {
  const hits = statistics
    ?.filter((statistic) =>
      query ? statistic.shortname.toLowerCase().indexOf(statistic.shortname.toLowerCase()) > -1 : true
    )
    .map(({ shortname, name }) => ({
      id: shortname,
      displayName: shortname,
      description: name,
    }))

  return { hits, count: hits.length, total: statistics.length }
}

export function get(req: Request) {
  const statistics = fetchStatisticsFromStatregApi({ start: 0, count: 1000 })
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
    body: filterStatisticsByName(statistics, query),
    contentType: 'application/json',
  }
}
