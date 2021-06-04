import { Content, ContentLibrary } from 'enonic-types/content'
import { Page } from '../../../site/content-types/page/page'
import { DefaultPageConfig } from '../../../site/pages/default/default-page-config'
const {
  query
}: ContentLibrary = __non_webpack_require__('/lib/xp/content')

export function getMainSubjects(): Array<MainSubjectItem> {
  const mainSubjectsContent: Array<Content<Page, DefaultPageConfig>> = query({
    start: 0,
    count: 100,
    query: 'components.page.config.mimir.default.subjectType LIKE "mainSubject"'
  }).hits as unknown as Array<Content<Page, DefaultPageConfig>>

  const mainSubjects: Array<MainSubjectItem> = mainSubjectsContent.map((m) => {
    return (
      {
        title: m.displayName,
        subjectCode: m.page.config.subjectCode ? m.page.config.subjectCode : '',
        path: m._path,
        language: m.language && m.language === 'en' ? 'en' : 'no',
        name: m._name
      }
    )
  })

  return mainSubjects
}

export function getMainSubjectsByLanguage(mainSubjects: Array<MainSubjectItem>, language: string): Array<MainSubjectItem> {
  return mainSubjects.filter((mainSubject) =>
    mainSubject.language === language)
}

export function getMainSubjectByNameAndLanguage(mainSubjects: Array<MainSubjectItem>, language: string, name: string): MainSubjectItem | null {
  log.info('getMainSubjectByNameAndLanguage: ' + name + ' - ' + language)
  const mainSub: Array<MainSubjectItem> = mainSubjects.filter((mainSubject) =>
    mainSubject.language === language && mainSubject.name === name)

  if (mainSub.length > 0) {
    return mainSub[0]
  }

  return null
}

export interface MainSubjectItem {
    title: string;
    subjectCode?: string;
    path: string;
    language: string;
    name: string;
}

export interface MainSubject {
    subjectCode: string;
    name: string;
    titles: Array<Title>;
    // subSubjects: Array<SubSubject>;
}


export interface SubSubject {
    code: string;
    titles: Array<Title>;
    statistics: Array<Statistics>;
}

export interface Title {
    title: string;
    language: string;
}

interface Statistics {
    shortName: string;
    isPrimaryLocated: boolean;
    titles: Array<Title>;
}

export interface SubjectUtilsLib {
    getMainSubjects: () => Array<MainSubjectItem>;
    getMainSubjectsByLanguage: (mainsubjects: Array<MainSubjectItem>) => Array<MainSubjectItem>;
    getMainSubjectByNameAndLanguage: (mainsubjects: Array<MainSubjectItem>) => MainSubjectItem;
  }

