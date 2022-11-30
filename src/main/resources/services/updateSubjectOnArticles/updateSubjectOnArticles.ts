import { Article } from '/site/content-types'
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

import { pageUrl } from '/lib/xp/portal'
import { getToolUrl } from '/lib/xp/admin'
const DEFAULT_CONTENTSTUDIO_URL = getToolUrl('com.enonic.app.contentstudio', 'main')
const ENONIC_PROJECT_ID = app.config && app.config['ssb.project.id'] ? app.config['ssb.project.id'] : 'default'

const contentStudioBaseUrl = `${DEFAULT_CONTENTSTUDIO_URL}#/${ENONIC_PROJECT_ID}/edit/`

const INTERNAL_BASE_URL =
  app.config && app.config['ssb.internal.baseUrl'] ? app.config['ssb.internal.baseUrl'] : 'https://i.ssb.no'

export function get(req: XP.Request): XP.Response {
  const contentToFix: QueryResponse<Article, XpXData, object> = query({
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

  const fixedContents: Array<Content<Article, XpXData>> = []
  const editedUnpublishedContents: Array<{ name: string; url: string }> = []
  const publishResult: Array<PublishResponse> = []

  contentToFix.hits.forEach((hit) => {
    const masterVersion = run(createUserContext, () => {
      return getContent({ key: hit._id })
    })

    const preparedArticle = addSubjectToXData(hit, req)
    preparedArticle && fixedContents.push(preparedArticle)

    if (masterVersion?.modifiedTime == hit.modifiedTime && preparedArticle) {
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
    } else if (preparedArticle) {
      // editedUnpublishedContents.push(INTERNAL_BASE_URL + pageUrl({ id: preparedArticle._id }))
      editedUnpublishedContents.push({
        name: preparedArticle._name,
        url: INTERNAL_BASE_URL + contentStudioBaseUrl + preparedArticle._id,
      })
    }
  })

  return {
    body: { count: fixedContents.length, fixedContents, publishResult, editedUnpublishedContents },
    contentType: 'application/json',
  }
}
