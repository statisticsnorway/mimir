import { Article } from 'site/content-types/article/article'
import { XData } from 'site/x-data'
import { notNullOrUndefined } from '/lib/ssb/utils/coreUtils'
import {
  getAllMainSubjectByContent,
  getAllSubSubjectByContent,
  getMainSubjects,
  getSubSubjects,
  type SubjectItem,
} from '/lib/ssb/utils/subjectUtils'
import {
  get as getContent,
  modify,
  publish,
  query,
  type Content,
  type QueryResponse,
  type PublishResponse,
} from '/lib/xp/content'
import { run, type ContextAttributes, type RunContext } from '/lib/xp/context'

import { ENONIC_CMS_DEFAULT_REPO } from '/lib/ssb/repo/common'

export function get(req: XP.Request): XP.Response {
  const contentToFix: QueryResponse<Article, XData, object> = query({
    query: '',
    count: 500,
    contentTypes: [`${app.name}:article`],
    filters: {
      boolean: {
        mustNot: [
          {
            exists: {
              field: 'x.mimir.subjectTag',
            },
          },
        ],
      },
    },
  })

  const createUserContext: RunContext<ContextAttributes> = {
    // Master context (XP)
    repository: ENONIC_CMS_DEFAULT_REPO,
    branch: 'master',
    principals: ['role:system.admin'],
    user: {
      login: 'su',
      idProvider: 'system',
    },
  }

  const allMainSubjects: SubjectItem[] = getMainSubjects(req, 'nb')
  const allSubSubjects: SubjectItem[] = getSubSubjects(req, 'nb')

  log.info(`Antall mainSubjects: ${allMainSubjects.length}, antall subSubjects: ${allSubSubjects.length}`)

  const fixedContents: Array<Content<Article, XData>> = []
  const contentsToPublish: Array<string> = []
  const publishResult: Array<PublishResponse> = []

  contentToFix.hits.forEach((hit) => {
    const mainSubjects: string[] = getAllMainSubjectByContent(hit, allMainSubjects, allSubSubjects)
      .map((subject) => subject.name)
      .filter(notNullOrUndefined)
    const subSubjects: string[] = getAllSubSubjectByContent(hit, allSubSubjects)
      .map((subject) => subject.name)
      .filter(notNullOrUndefined)

    const masterVersion = run(createUserContext, () => {
      return getContent({ key: hit._id })
    })

    if (mainSubjects.length || subSubjects.length) {
      // log.info(
      //   `the mainSubjects for article with title ${hit._name}: ${mainSubjects} and the subSubjects: ${subSubjects}`
      // )
      const modified = modify({
        key: hit._id,
        requireValid: false,
        editor: (content: Content<Article, XData>) => {
          content.x = {
            ...content.x,
            mimir: {
              subjectTag: {
                mainSubjects: mainSubjects,
                subSubjects: subSubjects,
              },
            },
          }
          return content
        },
      })
      if (masterVersion?.modifiedTime == hit.modifiedTime) {
        // contentsToPublish.push(modified._id)
        run(createUserContext, () => {
          publishResult.push(
            publish({
              keys: [hit._id],
              sourceBranch: 'draft',
              targetBranch: 'master',
              includeDependencies: false,
            })
          )
        })
      }
      fixedContents.push(modified)
    }
  })

  // if (contentsToPublish.length) {
  // }
  // let publishResult: Array<PublishResponse>
  // run(createUserContext, () => {
  //   publishResult.push(publish({
  //     keys: contentsToPublish,
  //     sourceBranch: 'draft',
  //     targetBranch: 'master',
  //     includeDependencies: false,
  //   }))
  // })
  //   return {
  //     body: { count: fixedContents.length, fixedContents, publishResult },
  //     contentType: 'application/json',
  //   }
  // } else
  return {
    body: { count: fixedContents.length, fixedContents, publishResult },
    contentType: 'application/json',
  }
}
