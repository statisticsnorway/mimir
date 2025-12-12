import { type Request, type Response } from '@enonic-types/core'
import { fetchProjectCristin } from '/lib/ssb/cristin/cristin'

export const get = (req: Request): Response => {
  const projectId = req.params.projectId ? (req.params.projectId as string | number) : ''
  const project = fetchProjectCristin(projectId)

  return {
    body: project,
    contentType: 'application/json',
  }
}
