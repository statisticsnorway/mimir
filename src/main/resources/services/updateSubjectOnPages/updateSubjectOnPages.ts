// import type { Page } from 'site/content-types/page/page'
// import { query, modify, type QueryResponse, type Content } from '/lib/xp/content'
// import type { SubjectTag } from '../../site/x-data/subjectTag/subjectTag'
// import { DefaultPageConfig } from 'site/pages/default/default-page-config'

// export function get(req: XP.Request): XP.Response {
//   const contentToFix: QueryResponse<Page, PageXData, object> = query({
//     query: '',
//     count: 50,
//     contentTypes: [`${app.name}:page`],
//     filters: {
//       boolean: {
//         mustNot: [
//           {
//             hasValue: {
//               field: 'x.mimir.subjectTag.subjectType',
//               values: ['subSubject', 'mainSubject'],
//             },
//           },
//         ],
//       },
//     },
//   })

//   const fixedContents: Array<Content<Page, PageXData>> = []
//   // let contentKey: string
//   // let typeString: 'mainSubject' | 'subSubject' | undefined
//   // let subjectCode: string

//   contentToFix.hits.forEach((hit) => {
//     const testType: DefaultPageConfig = hit.page.config as DefaultPageConfig
//     if (testType?.subjectType && testType?.subjectCode) {
//       const contentKey: string = hit._id
//       const typeString: 'mainSubject' | 'subSubject' | undefined = testType.subjectType
//       const subjectCode: string = testType.subjectCode

//       fixedContents.push(edit(contentKey, typeString, subjectCode))

//       log.info(`${typeString}: ${subjectCode}`)
//     }
//   })

//   return {
//     body: { fixedContents },
//     contentType: 'application/json',
//   }
// }

// function edit(key: string, type: 'mainSubject' | 'subSubject' | undefined, code: string): Content<Page, PageXData> {
//   function editor(content: Content<Page, PageXData>) {
//     // ;(content.x.mimir.subjectTag.subjectType = type), (content.x.mimir.subjectTag.subjectCode = code)
//     content.x = {
//       ...content.x,
//       mimir: {
//         subjectTag: {
//           subjectCode: code,
//           subjectType: type,
//         },
//       },
//     }
//     return content
//   }

//   return modify({
//     key: key,
//     requireValid: true,
//     editor: editor,
//   })
// }

// interface PageXData {
//   mimir: {
//     subjectTag: SubjectTag
//   }
// }
