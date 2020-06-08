import { getStatisticsFromRepo } from '../../lib/repo/statreg/statistics'
import { handleRepoGet } from '../repoUtils'

const toOption = ({ id, name }) => ({
  id,
  displayName: name,
  name
})

const filterByName = (stat, filters) =>
  stat.name.toLowerCase().includes(filters.query)

exports.get = (req) => {
  return handleRepoGet(
    req,
    'Statistics', getStatisticsFromRepo,
    toOption, filterByName)
}
