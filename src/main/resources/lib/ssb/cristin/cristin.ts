import { fetchResults, fetchProject, fetchPersonResults } from '/lib/cristin/service'

export function fetchResultsCristin(
  contributor?: string,
  category?: string,
  per_page = '10',
  page?: string,
  sort?: string
) {
  const results = fetchResults({
    institution: 'statistisk+sentralbyra',
    contributor,
    category,
    per_page,
    page,
    sort,
  })

  return results
}

export function fetchProjectCristin(projectId: string | number) {
  const project = fetchProject({
    id: projectId,
  })
  const projectResultsIds: Array<string> | undefined =
    project.results && (project.results.map((result) => result.split('/').pop()) as Array<string> | undefined)

  return {
    ...project,
    results: projectResultsIds,
  }
}

export function fetchPersonResultsCristin(personId?: string, per_page = '10', page?: string) {
  const results = fetchPersonResults({
    id: personId,
    per_page,
    page,
  })

  return results
}
