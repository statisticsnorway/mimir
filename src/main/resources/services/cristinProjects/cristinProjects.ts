import { FetchResponse, ListOfProjects } from '/lib/cristin/service'
import { fetchProjectsCristin } from '../../lib/ssb/cristin/cristin'

exports.get = (req: XP.Request): XP.Response => {
  const projectId: string | undefined = req.params.projectId
  const participant: string | undefined = req.params.participants
  const status: string | undefined = req.params.status
  // eslint-disable-next-line camelcase
  const per_page: string = req.params.per_page ? req.params.per_page : '10'
  const page: string | undefined = req.params.page
  const sort: string | undefined = req.params.sort

  const results: FetchResponse<ListOfProjects> = fetchProjectsCristin(projectId, participant, status, per_page, page, sort)

  return {
    body: results,
    contentType: 'application/json'
  }
}
