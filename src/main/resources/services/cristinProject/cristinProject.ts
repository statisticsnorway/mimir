import { Project } from '/lib/cristin/service'
import { fetchProjectCristin } from '../../lib/ssb/cristin/cristin'

exports.get = (req: XP.Request): XP.Response => {
  const projectId: string | number = req.params.projectId ? req.params.projectId : ''
  const project: Project = fetchProjectCristin(projectId)
  const projectResultsIds: Array<string | undefined> | undefined = project.results && project.results.map((result) => result.split('/').pop())

  return {
    body: {
      ...project,
      results: projectResultsIds
    },
    contentType: 'application/json'
  }
}
