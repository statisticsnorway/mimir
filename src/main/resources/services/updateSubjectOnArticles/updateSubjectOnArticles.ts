import { Article } from 'site/content-types/article/article'
import { XData } from 'site/x-data'
import { addSubjectToXData } from '/lib/ssb/utils/articleUtils'
import {
  get as getContent,
  publish,
  query,
  type Content,
  type PublishResponse,
  type QueryResponse,
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

  const fixedContents: Array<Content<Article, XData>> = []
  // const contentsToPublish: Array<string> = []
  const publishResult: Array<PublishResponse> = []

  contentToFix.hits.forEach((hit) => {
    const masterVersion = run(createUserContext, () => {
      return getContent({ key: hit._id })
    })

    const preparedArticle = addSubjectToXData(hit, req)
    preparedArticle && fixedContents.push(preparedArticle)

    if (masterVersion?.modifiedTime == hit.modifiedTime && preparedArticle) {
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
