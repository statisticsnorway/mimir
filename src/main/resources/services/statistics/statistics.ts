import '/lib/ssb/polyfills/nashorn'
import { type Request } from '@enonic-types/core'
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

const filterByShortName = (stat, filters) => {
  if (!filters.query) {
    return stat
  }

  log.info(`searching ${filters.query} in ${stat.length} statistics`)
  return stat.filter((s) => s.shortName.toLowerCase().includes(filters.query.toLowerCase()))
}

const filterByIds = (stat, filters) => {
  return (
    filters.ids &&
    filters.ids.split(',').reduce((acc, id) => {
      const found = stat.find((s) => `${s.id}` === id)
      return found ? acc.concat(found) : acc
    }, [])
  )
}

export function get(req: Request) {
  return handleRepoGet(
    req,
    'Statistics',
    getAllStatisticsFromRepo,
    toOption,
    req.params.ids ? filterByIds : filterByShortName
  )
}

export function post(req: Request) {
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
