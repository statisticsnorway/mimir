import '/lib/ssb/polyfills/nashorn'
import { type Request } from '@enonic-types/core'
import { fetchStatisticsFromStatregApi } from '/lib/ssb/statreg/statistics'

// TODO: Filter by shortname

// TODO: Filter by name

export function get(req: Request) {
  const response = fetchStatisticsFromStatregApi({ start: 0, count: 1000 })

  if (!response) {
    return {
      contentType: 'application/json',
      body: response?.error,
      status: 400, //TODO: Fetch status from API
    }
  }

  return {
    status: 200,
    body: {
      hits: response.statistics?.map(({ shortname, name }) => ({
        id: shortname,
        displayName: shortname,
        description: name,
      })),
      count: response.statistics?.length,
      total: response.total,
    },
    contentType: 'application/json',
  }
}
