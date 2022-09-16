// import { Result, ListOfResults, fetchResult, fetchPersonResults } from '/lib/cristin/service'
import { Result, ListOfResults, FetchResponse, Project, fetchResult, fetchResults, fetchProject } from '/lib/cristin/service'

export function fetchResultCristin(id: string): Result | void {
  // filtrering - category, contributor. per side. paginering
  const result: Result | void = fetchResult({
    id
  })

  return result
//   return {
//     category: result.category,
//     contributors: result.contributors,
//     cristin_result_id: result.cristin_result_id,
//     links: result.links,
//     title: result.title,
//     year_reported: result.year_published
//   }
}

// TODO: Publikasjon, forside
export function fetchResultsCristin(): FetchResponse<ListOfResults> {
  const results: FetchResponse<ListOfResults> = fetchResults({
    institution: 'statistisk+sentralbyra',
    per_page: '5',
    sort: 'desc'
  })

  return results
}

// TODO: Publikasjonsopplisting, ansattside
// export function fetchPersonResultsCristin(personId: string): ListOfResults {
//   const personResults: ListOfResults = fetchPersonResults({
//     personId
//   })

//   return personResults
// }

// TODO: Prosjektside
export function fetchProjectCristin(projectId: string): Project {
  const project: Project = fetchProject({
    id: projectId
  })

  return project
}
