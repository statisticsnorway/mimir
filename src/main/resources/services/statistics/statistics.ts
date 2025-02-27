import '/lib/ssb/polyfills/nashorn'
import { run } from '/lib/xp/context'
import { getAllStatisticsFromRepo } from '/lib/ssb/statreg/statistics'
import { handleRepoGet } from '/lib/ssb/dashboard/statreg/repoUtils'
import { publishDataset } from '/lib/ssb/dataset/publishOld'
import { cronContext } from '/lib/ssb/cron/cron'

const toOption = (stat) => ({
  ...stat,
  displayName: stat.shortName,
  description: stat.name,
})

const filterByShortName = (stats, filters) => {
  if (!filters.query) {
    return stats
  }

  log.info(`searching ${filters.query} in ${stats.length} stats`)
  return stats.filter((s) => s.shortName.toLowerCase().includes(filters.query.toLowerCase()))
}

const filterByIds = (stats, filters) => {
  return (
    filters.ids &&
    filters.ids.split(',').reduce((acc, id) => {
      const found = stats.find((s) => `${s.id}` === id)
      return found ? acc.concat(found) : acc
    }, [])
  )
}

export function get(req: XP.Request) {
  return handleRepoGet(
    req,
    'Statistics',
    getAllStatisticsFromRepo,
    toOption,
    req.params.ids ? filterByIds : filterByShortName
  )
}

export function post(req: XP.Request) {
  if (req.params.runPublishDataset === 'OK') {
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
