import { Project } from '/lib/cristin/service'
import { fetchProjectCristin } from '../../lib/ssb/cristin/cristin'

exports.get = (req: XP.Request): XP.Response => {
  const projectId: string | number = req.params.projectId ? req.params.projectId : ''
  const result: Project = fetchProjectCristin(projectId)

  return {
    body: result,
    contentType: 'application/json'
  }
}
