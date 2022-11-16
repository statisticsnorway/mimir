import { query, modify, type QueryResponse, type Content } from '/lib/xp/content'
import { modify as repoModify } from '/lib/xp/repo'
import {
  getAllMainSubjectByContent,
  getAllSubSubjectByContent,
  getMainSubjects,
  getSubSubjects,
  type SubjectItem,
} from '/lib/ssb/utils/subjectUtils'
import { Article } from 'site/content-types/article/article'
import { notNullOrUndefined } from '/lib/ssb/utils/coreUtils'
import { XData } from 'site/x-data'
import { getRepo } from '/lib/ssb/repo/repo'

export function get(req: XP.Request): XP.Response {
  const contentToFix: QueryResponse<Article, XData, object> = query({
    query: "_id = '3258e811-3a7a-46d2-9412-c9a28ddb58e7'",
    count: 50,
    contentTypes: [`${app.name}:article`],
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

  const conn = getRepo('com.enonic.cms.default', 'master')

  return {
    body: contentToFix,
    contentType: 'application/json',
  }

  // const allMainSubjects: SubjectItem[] = getMainSubjects(req, 'nb')
  // const allSubSubjects: SubjectItem[] = getSubSubjects(req, 'nb')

  // log.info(`Antall mainSubjects: ${allMainSubjects.length}, antall subSubjects: ${allSubSubjects.length}`)

  // const fixedContents: Array<Content<Article, XData>> = []

  // contentToFix.hits.forEach((hit) => {
  //   const contentKey: string = hit._id
  //   const mainSubjects: string[] = getAllMainSubjectByContent(hit, allMainSubjects, allSubSubjects)
  //     .map((subject) => subject.name)
  //     .filter(notNullOrUndefined)
  //   const subSubjects: string[] = getAllSubSubjectByContent(hit, allSubSubjects)
  //     .map((subject) => subject.name)
  //     .filter(notNullOrUndefined)

  //   fixedContents.push(edit(contentKey, mainSubjects, subSubjects))

  //   log.info(`${mainSubjects}: ${subSubjects}`)
  // })

  // return {
  //   body: { fixedContents },
  //   contentType: 'application/json',
  // }
}

function edit(key: string, mainSubjects: string[], subSubjects: string[]): Content<Article, XData> {
  function editor(content: Content<Article, XData>) {
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
  }

  return modify({
    key: key,
    editor: editor,
    requireValid: true,
  })
}
