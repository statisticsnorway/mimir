import { multiRepoConnect, type MultiRepoConnection, type MultiRepoNodeQueryResponse } from '/lib/xp/node'
import { type Context, type ContextAttributes, get as getContext, type PrincipalKey } from '/lib/xp/context'
// import { getMainSubjects } from '../utils/subjectUtils'

export function getUpcomingReleasesResults(req: XP.Request, start: number, count: number, language: string) {
  // const allMainSubjects: Array<SubjectItem> = getMainSubjects(req, language)
  const context: Context<ContextAttributes> = getContext()

  const connection: MultiRepoConnection = multiRepoConnect({
    sources: [
      {
        repoId: context.repository,
        branch: context.branch,
        principals: context.authInfo.principals as Array<PrincipalKey>,
      },
      {
        repoId: 'no.ssb.statreg.statistics.variants',
        branch: 'master',
        principals: context.authInfo.principals as Array<PrincipalKey>,
      },
    ],
  })

  const results: MultiRepoNodeQueryResponse = connection.query({
    start,
    count,
    query: {
      range: {
        field: 'data.date',
        type: 'dateTime',
        gte: new Date().toISOString(),
      },
    } as unknown as string,
    filters: {
      boolean: {
        //contentReleases
        should: [
          {
            boolean: {
              must: [
                {
                  hasValue: {
                    field: 'language',
                    values: [language],
                  },
                },
                {
                  hasValue: {
                    field: 'type',
                    values: [`${app.name}:upcomingRelease`],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  })

  return results
}

export interface UpcomingReleasesResults {
  total: number
  upcomingReleases: Array<UpcomingReleases>
}

export interface UpcomingReleases {
  id: string
  name: string
  type: string
  date: string
  mainSubject: string
  day: string
  month: string
  monthName: string
  year: string
  upcomingReleaseLink?: string
}
