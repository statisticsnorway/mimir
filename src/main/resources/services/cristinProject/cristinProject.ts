import { Project } from '/lib/cristin/service'
import { fetchProjectCristin } from '../../lib/ssb/cristin/cristin'

exports.get = (req: XP.Request): XP.Response => {
  const projectId: string | number = req.params.projectId ? req.params.projectId : ''
  const project: Project = fetchProjectCristin(projectId)

  return {
    body: project,
    contentType: 'application/json'
  }
}
