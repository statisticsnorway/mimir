import { ListOfResults, FetchResponse, ListOfProjects, fetchResults, fetchProjects, fetchPersonResults } from '/lib/cristin/service'

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

export function fetchProjectsCristin(
  projectId?: string,
  participant?: string,
  status?: string,
  per_page: string = '10',
  page?: string,
  sort?: string
): FetchResponse<ListOfProjects> {
  const project: FetchResponse<ListOfProjects> = fetchProjects({
    id: projectId,
    institution: 'statistisk+sentralbyra',
    participant,
    status,
    per_page,
    page,
    sort
  })

  return project
}

export function fetchPersonResultsCristin(personId?: string, per_page: string = '10', page?: string): ListOfResults {
  const results: ListOfResults = fetchPersonResults({
    id: personId,
    per_page,
    page
  })

  return results
}
