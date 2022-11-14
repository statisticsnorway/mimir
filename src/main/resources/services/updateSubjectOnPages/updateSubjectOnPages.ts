import type { Page } from 'site/content-types/page/page'
import { query, type QueryResponse } from '/lib/xp/content'
import type { SubjectTag } from '../../site/x-data/subjectTag/subjectTag'
import { DefaultPageConfig } from 'site/pages/default/default-page-config'

export function get(req: XP.Request): XP.Response {
  const contentToFix: QueryResponse<Page, SubjectTag, object> = query({
    query: '',
    count: 50,
    contentTypes: [`${app.name}:page`],
    filters: {
      boolean: {
        mustNot: [
          {
            hasValue: {
              field: 'x.mimir.subjectTag.subjectType',
              values: ['subSubject', 'mainSubject'],
            },
          },
        ],
      },
    },
  })

  contentToFix.hits.forEach((hit) => {
    const testType: DefaultPageConfig = hit.page.config as DefaultPageConfig
    if (testType?.subjectType) {
      const typeString: string = testType.subjectType
      const subjectCode: string = testType.subjectCode ?? 'no code'
      log.info(`${typeString}: ${subjectCode}`)
    }
  })

  return {
    body: { contentToFix }, //JSON.stringify({}, null, 2),
  }
}
