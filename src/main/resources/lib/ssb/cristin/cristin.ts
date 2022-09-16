// import { Result, ListOfResults, fetchResult, fetchPersonResults } from '/lib/cristin/service'
import { Result, ListOfResults, FetchResponse, Project, fetchResult, fetchResults, fetchProject } from '/lib/cristin/service'

export function fetchResultCristin(id: string): Result | void {
  // filtrering - category, contributor. per side. paginering
  const result: Result | void = fetchResult({
    id
  })

  return result
}

export function fetchResultsCristin(contributor?: string, category?: string, per_page: string = '10', page?: string): FetchResponse<ListOfResults> {
  const results: FetchResponse<ListOfResults> = fetchResults({
    institution: 'statistisk+sentralbyra',
    contributor: contributor,
    category: category,
    per_page: per_page,
    page: page
    // sort: 'desc'
  })

  return results
}

export function fetchProjectCristin(projectId: string): Project {
  const project: Project = fetchProject({
    id: projectId
  })

  return project
}
