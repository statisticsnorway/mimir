import { query, modify, type QueryResponse, type Content } from '/lib/xp/content'
import {
  getAllMainSubjectByContent,
  getAllSubSubjectByContent,
  getMainSubjects,
  getSubSubjects,
  type SubjectItem,
} from '/lib/ssb/utils/subjectUtils'
import { Article } from 'site/content-types/article/article'
import { notNullOrUndefined } from '/lib/ssb/utils/coreUtils'

export function get(req: XP.Request): XP.Response {
  const contentToFix: QueryResponse<Article, PageXData, object> = query({
    query: '',
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

  const allMainSubjects: SubjectItem[] = getMainSubjects(req, 'nb')
  const allSubSubjects: SubjectItem[] = getSubSubjects(req, 'nb')

  log.info(`Antall mainSubjects: ${allMainSubjects.length}, antall subSubjects: ${allSubSubjects.length}`)

  const fixedContents: Array<Content<Article, PageXData>> = []

  contentToFix.hits.forEach((hit) => {
    const contentKey: string = hit._id
    const mainSubjects: string[] = getAllMainSubjectByContent(hit, allMainSubjects, allSubSubjects)
      .map((subject) => subject.name)
      .filter(notNullOrUndefined)
    const subSubjects: string[] = getAllSubSubjectByContent(hit, allSubSubjects)
      .map((subject) => subject.name)
      .filter(notNullOrUndefined)

    fixedContents.push(edit(contentKey, mainSubjects, subSubjects))

    log.info(`${mainSubjects}: ${subSubjects}`)
  })

  return {
    body: { fixedContents },
    contentType: 'application/json',
  }
}

function edit(key: string, mainSubjects: string[], subSubjects: string[]): Content<Article, PageXData> {
  function editor(content: Content<Article, PageXData>) {
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

interface PageXData {
  mimir: {
    subjectTag: {
      mainSubjects: string[]
      subSubjects: string[]
    }
  }
}
