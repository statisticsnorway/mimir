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

export function getSubSubjects(): Array<SubSubjectItem> {
  const subSubjectsContent: Array<Content<Page, DefaultPageConfig>> = query({
    start: 0,
    count: 100,
    query: 'components.page.config.mimir.default.subjectType LIKE "subSubject"'
  }).hits as unknown as Array<Content<Page, DefaultPageConfig>>

  const subSubjects: Array<SubSubjectItem> = subSubjectsContent.map((m) => {
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

  return subSubjects
}

export function getMainSubjectsByLanguage(mainSubjects: Array<MainSubjectItem>, language: string): Array<MainSubjectItem> {
  return mainSubjects.filter((mainSubject) =>
    mainSubject.language === language)
}

export function getMainSubjectByNameAndLanguage(mainSubjects: Array<MainSubjectItem>, language: string, name: string): MainSubjectItem | null {
  const mainSub: Array<MainSubjectItem> = mainSubjects.filter((mainSubject) =>
    mainSubject.language === language && mainSubject.name === name)

  if (mainSub.length > 0) {
    return mainSub[0]
  }

  return null
}

export function getSubSubjectByNameAndLanguage(subSubjects: Array<SubSubjectItem>, language: string, name: string): SubSubjectItem | null {
  const subSub: Array<MainSubjectItem> = subSubjects.filter((subSubject) =>
    subSubject.language === language && subSubject.name === name)

  if (subSub.length > 0) {
    return subSub[0]
  }

  return null
}

export function getTitlesMainSubjectByName(subjects: Array<MainSubjectItem>, name: string): Array<Title> | null {
  const mainSubjectNorwegian: MainSubjectItem | null = getMainSubjectByNameAndLanguage(subjects, 'no', name)
  const mainSubjectEnglish: MainSubjectItem | null = getMainSubjectByNameAndLanguage(subjects, 'en', name)
  const titles: Array<Title> = []
  if (mainSubjectNorwegian) {
    titles.push({
      title: mainSubjectNorwegian.title,
      language: 'no'
    })
  }

  if (mainSubjectEnglish) {
    titles.push({
      title: mainSubjectEnglish.title,
      language: 'en'
    })
  }

  return titles
}

export function getTitlesSubSubjectByName(subjects: Array<SubSubjectItem>, name: string): Array<Title> | null {
  const subjectNorwegian: MainSubjectItem | null = getSubSubjectByNameAndLanguage(subjects, 'no', name)
  const subjectEnglish: MainSubjectItem | null = getSubSubjectByNameAndLanguage(subjects, 'en', name)
  const titles: Array<Title> = []
  if (subjectNorwegian) {
    titles.push({
      title: subjectNorwegian.title,
      language: 'no'
    })
  }

  if (subjectEnglish) {
    titles.push({
      title: subjectEnglish.title,
      language: 'en'
    })
  }

  return titles
}

export function getSubSubjectsByPath(subSubjects: Array<SubSubjectItem>, path: string): Array<SubSubjectItem> {
  return subSubjects.filter((subSubject) =>
    subSubject.path.startsWith(path))
}

export function getSubSubjectsMainSubject(subjects: Array<SubSubjectItem>, path: string): Array<SubSubject> {
  const subSubjects: Array<SubSubject> = []
  const subSubjectsPath: Array<SubSubjectItem> = getSubSubjectsByPath(subjects, path)
  if (subSubjectsPath.length > 0) {
    subSubjectsPath.map((s) => {
      const titles: Array<Title> | null = getTitlesSubSubjectByName(subjects, s.name)
      subSubjects.push({
        code: s.subjectCode ? s.subjectCode : '',
        titles: titles ? titles : []
      })
    })
  }

  return subSubjects
}

export interface MainSubjectItem {
    title: string;
    subjectCode?: string;
    path: string;
    language: string;
    name: string;
}

export interface SubSubjectItem {
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
    subSubjects: Array<SubSubject>;
}


export interface SubSubject {
    code: string;
    titles: Array<Title>;
    // statistics: Array<Statistics>;
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
    getSubSubjects: () => Array<SubSubjectItem>;
    getMainSubjectsByLanguage: (mainsubjects: Array<MainSubjectItem>, language: string) => Array<MainSubjectItem>;
    getMainSubjectByNameAndLanguage: (mainsubjects: Array<MainSubjectItem>, language: string, name: string) => MainSubjectItem;
    getSubSubjectsByPath: (subSubjects: Array<SubSubjectItem>, path: string) => Array<SubSubjectItem>;
    getTitlesMainSubjectByName: (subjects: Array<MainSubjectItem>, name: string) => Array<Title> | null;
    getTitlesSubSubjectByName: (subjects: Array<SubSubjectItem>, name: string) => Array<Title> | null;
    getSubSubjectByNameAndLanguage: (subsubjects: Array<SubSubjectItem>, language: string, name: string) => SubSubjectItem;
    getSubSubjectsMainSubject: (subjects: Array<SubSubjectItem>, path: string) => Array<SubSubject>;
  }

