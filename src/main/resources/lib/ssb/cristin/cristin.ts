import { FetchResponse, ListOfResults, Project, fetchResults, fetchProject, fetchPersonResults } from '/lib/cristin/service'

export function fetchResultsCristin(
  contributor?: string,
  category?: string,
  per_page: string = '10',
  page?: string,
  sort?: string
): FetchResponse<ListOfResults> {
  const results: FetchResponse<ListOfResults> = fetchResults({
    institution: 'statistisk+sentralbyra',
    contributor,
    category,
    per_page,
    page,
    sort
  })

  return results
}

export function fetchProjectCristin(projectId: string | number): Project {
  const project: Project = fetchProject({
    id: projectId
  })
  const projectResultsIds: Array<string> | undefined = project.results && project.results.map((result) => result.split('/').pop()) as Array<string> | undefined

  return {
    ...project,
    results: projectResultsIds
  }
}

export function fetchPersonResultsCristin(personId?: string, per_page: string = '10', page?: string): ListOfResults {
  const results: ListOfResults = fetchPersonResults({
    id: personId,
    per_page,
    page
  })

  return results
}
