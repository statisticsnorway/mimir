import '/lib/ssb/polyfills/nashorn'
import { type Request } from '@enonic-types/core'
import { run } from '/lib/xp/context'
import { getAllStatisticsFromRepo, fetchStatisticsFromStatregApi } from '/lib/ssb/statreg/statistics'
import { handleRepoGet } from '/lib/ssb/dashboard/statreg/repoUtils'
import { publishDataset } from '/lib/ssb/dataset/publishOld'
import { cronContext } from '/lib/ssb/cron/cron'
import { isEnabled } from '/lib/featureToggle'

const toOption = (statistic) => ({
  ...statistic,
  displayName: statistic.shortName,
  description: statistic.name,
})

const filterByShortName = (statistics, filters) => {
  if (!filters.query) {
    return statistics
  }

  log.info(`searching ${filters.query} in ${statistics.length} statistics`)
  return statistics.filter((s) => s.shortName.toLowerCase().includes(filters.query.toLowerCase()))
}

const filterByIds = (statistics, filters) => {
  return (
    filters.ids &&
    filters.ids.split(',').reduce((acc, id) => {
      const found = statistics.find((s) => `${s.id}` === id)
      return found ? acc.concat(found) : acc
    }, [])
  )
}

export function get(req: Request) {
  if (isEnabled('new-statreg-as-source', false, 'ssb')) {
    const response = fetchStatisticsFromStatregApi({ start: 0, count: 1000 })

    if (!response) {
      return {
        contentType: 'application/json',
        status: 400,
      }
    }

    return {
      status: 200,
      body: {
        hits: response.statistics?.map(({ id, shortname, name }) => ({
          id,
          displayName: shortname,
          description: name,
        })),
        count: response.statistics?.length,
        total: response.total,
      },
      contentType: 'application/json',
    }
  } else {
    return handleRepoGet(
      req,
      'Statistics',
      getAllStatisticsFromRepo,
      toOption,
      req.params.ids ? filterByIds : filterByShortName
    )
  }
}

export function post(req: Request) {
  if (req.params.runPublishDataset === 'OK' && !isEnabled('new-statreg-as-source', false, 'ssb')) {
    run(cronContext, publishDataset)
    return {
      body: {
        status: 'Running statRegJon',
      },
      contentType: 'application/json',
      status: 200,
    }
  }

  return {
    contentType: 'application/json',
    status: 400,
  }
}
