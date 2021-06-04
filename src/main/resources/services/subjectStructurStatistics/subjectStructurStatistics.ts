import { Response } from 'enonic-types/controller'
import { Content, ContentLibrary } from 'enonic-types/content'
import { Page } from '../../site/content-types/page/page'
import { DefaultPageConfig } from '../../site/pages/default/default-page-config'
const {
  query
}: ContentLibrary = __non_webpack_require__('/lib/xp/content')

function get(): Response {
  const mainSubjectsContent: Array<Content<Page, DefaultPageConfig>> = query({
    start: 0,
    count: 100,
    query: 'components.page.config.mimir.default.subjectType LIKE "mainSubject"'
  }).hits as unknown as Array<Content<Page, DefaultPageConfig>>

  const mainSubjects: Array<MainSubject> = mainSubjectsContent.map((mainSubjectContent) => {
    return prepareMainSubject(mainSubjectContent)
  })

  log.info('ARRAY: ' + JSON.stringify(mainSubjects, null, 4))

  const xml: string =
  `<?xml version="1.0" encoding="utf-8"?>
  <result>
    <emnestruktur>
        ${[...mainSubjects].map((m: MainSubject) =>`<hovedemne emnekode=${m.subjectCode}>
        <titler>${m.title}</titler>
        </hovedemne>`).join('')}
    </emnestruktur>
  </result>`
  return {
    body: xml,
    contentType: 'text/xml'
  }


  /* return {
    status: 200,
    contentType: 'application/json',
    body: 'Heisann'
  } */
}
exports.get = get

function prepareMainSubject(mainSubject: Content<Page, DefaultPageConfig>): MainSubject {
  return (
    {
      title: mainSubject.displayName,
      subjectCode: mainSubject.page.config.subjectCode ? mainSubject.page.config.subjectCode : ''
    }
  )
}

interface MainSubject {
    title: string;
    subjectCode?: string;
    // titles: Array<Title>;
    // subSubjects: Array<SubSubject>;
}

interface SubSubject {
    code: string;
    titles: Array<Title>;
    statistics: Array<Statistics>;
}

interface Title {
    title: string;
    language: string;
}

interface Statistics {
    shortName: string;
    isPrimaryLocated: boolean;
    titles: Array<Title>;
}
