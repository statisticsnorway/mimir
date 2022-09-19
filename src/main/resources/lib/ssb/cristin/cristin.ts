import { ListOfResults, FetchResponse, Project, fetchResults, fetchProject, fetchPersonResults } from '/lib/cristin/service'

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

export function fetchProjectCristin(projectId: string): Project {
  const project: Project = fetchProject({
    id: projectId
  })

  return project
}

export function fetchPersonResultsCristin(personId?: string): ListOfResults {
  const results: ListOfResults = fetchPersonResults({
    id: personId
  })

  return results
}
