import { Result, Project, FetchResponse, ListOfResults } from '/lib/cristin/service'
// import { fetchResultCristin, fetchPersonResultsCristin } from '/lib/cristin/cristin'
import { fetchProjectCristin, fetchResultCristin, fetchResultsCristin } from '/lib/cristin/cristin'

exports.get = (): XP.Response => {
  // const result: Result | void = fetchResultCristin('1929571')
  // const personResults: Array<Result> = fetchPersonResultsCristin('23169')
  // const project: Project | void = fetchProjectCristin('555465')
  const results: FetchResponse<ListOfResults> = fetchResultsCristin()

  return {
    body: JSON.stringify({
      // result,
      // personResults,
      // project
      results
    }, null, 2),
    contentType: 'application/json'
  }
}
