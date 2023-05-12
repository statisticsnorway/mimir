import { fetchProjectCristin } from '/lib/ssb/cristin/cristin'

exports.get = (req: XP.Request): XP.Response => {
  const projectId: string | number = req.params.projectId ? req.params.projectId : ''
  const project = fetchProjectCristin(projectId)

  return {
    body: project,
    contentType: 'application/json',
  }
}
