import { Content } from 'enonic-types/content'
import { Page } from '../../../site/content-types/page/page'
import { DefaultPageConfig } from '../../../site/pages/default/default-page-config'
import { Statistics } from '../../../site/content-types/statistics/statistics'
import { StatisticInListing } from '../dashboard/statreg/types'
const {
  query
} = __non_webpack_require__('/lib/xp/content')
const {
  getAllStatisticsFromRepo
} = __non_webpack_require__('/lib/ssb/statreg/statistics')
const {
  ensureArray
} = __non_webpack_require__('/lib/ssb/utils/arrayUtils')


export function getMainSubjects(): Array<SubjectItem> {
  const mainSubjectsContent: Array<Content<Page, DefaultPageConfig>> = query({
    start: 0,
    count: 200,
    query: 'components.page.config.mimir.default.subjectType LIKE "mainSubject"'
  }).hits as unknown as Array<Content<Page, DefaultPageConfig>>

  const mainSubjects: Array<SubjectItem> = mainSubjectsContent.map((m) => {
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

export function getSubSubjects(): Array<SubjectItem> {
  const subSubjectsContent: Array<Content<Page, DefaultPageConfig>> = query({
    start: 0,
    count: 1000,
    query: 'components.page.config.mimir.default.subjectType LIKE "subSubject"'
  }).hits as unknown as Array<Content<Page, DefaultPageConfig>>

  const subSubjects: Array<SubjectItem> = subSubjectsContent.map((m) => {
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

export function getSubjectsByLanguage(subjects: Array<SubjectItem>, language: string): Array<SubjectItem> {
  return subjects.filter((subject) =>
    subject.language === language)
}

export function getSubjectByNameAndLanguage(subjectsItems: Array<SubjectItem>, language: string, name: string): SubjectItem | null {
  const subjects: Array<SubjectItem> = subjectsItems.filter((subjectsItem) =>
    subjectsItem.language === language && subjectsItem.name === name)

  if (subjects.length > 0) {
    return subjects[0]
  }

  return null
}

export function getTitlesBySubjectName(subjects: Array<SubjectItem>, name: string): Array<Title> | null {
  const subjectNorwegian: SubjectItem | null = getSubjectByNameAndLanguage(subjects, 'no', name)
  const subjectEnglish: SubjectItem | null = getSubjectByNameAndLanguage(subjects, 'en', name)
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

export function getSubSubjectsByPath(subSubjects: Array<SubjectItem>, path: string): Array<SubjectItem> {
  return subSubjects.filter((subSubject) =>
    subSubject.path.startsWith(path))
}

export function getSubSubjectsByMainSubjectPath(subjects: Array<SubjectItem>, statistics: Array<StatisticItem>, path: string): Array<SubSubject> {
  const subSubjects: Array<SubSubject> = []
  const subSubjectsPath: Array<SubjectItem> = getSubSubjectsByPath(subjects, path)
  if (subSubjectsPath.length > 0) {
    subSubjectsPath.map((s) => {
      const titles: Array<Title> | null = getTitlesBySubjectName(subjects, s.name)
      subSubjects.push({
        code: s.subjectCode ? s.subjectCode : '',
        titles: titles ? titles : [],
        statistics: getStatisticsByPath(statistics, s.path)
      })
    })
  }

  return subSubjects
}

export function getStatistics(): Array<StatisticItem> {
  const statisticContent: Array<Content<Statistics>> = query({
    start: 0,
    count: 2000,
    contentTypes: [`${app.name}:statistics`],
    query: `data.statistic LIKE '*'`
  }).hits as unknown as Array<Content<Statistics>>

  const statregStatistics: Array<StatisticInListing> = ensureArray(getAllStatisticsFromRepo())

  const statistics: Array<StatisticItem> = statregStatistics.length > 0 ? statisticContent.map((statistic: Content<Statistics>) => {
    const statreg: StatisticInListing | undefined = statregStatistics.find((s) => s.id.toString() === statistic.data.statistic)

    const titles: Array<Title> = [{
      title: statreg ? statreg.name : '',
      language: 'no'
    },
    {
      title: statreg ? statreg.nameEN : '',
      language: 'en'
    }]

    return (
      {
        name: statistic.displayName,
        path: statistic._path,
        language: statistic.language === 'en' ? 'en' : 'no',
        shortName: statreg ? statreg.shortName : '',
        isPrimaryLocated: true,
        titles: titles
      }
    )
  }) : []

  return statistics
}

export function getStatisticsByPath(statistics: Array<StatisticItem>, path: string): Array<StatisticItem> {
  return statistics.filter((s: StatisticItem) => s.path.startsWith(path))
}

export function getSubjectStructur(language: string): Array<MainSubject> {
  const mainSubjectsAll: Array<SubjectItem> = getMainSubjects()
  const subSubjectsAll: Array<SubjectItem> = getSubSubjects()
  const statistics: Array<StatisticItem> = getStatistics()
  const mainSubjectsNorwegian: Array<SubjectItem> = getSubjectsByLanguage(getMainSubjects(), language)

  const mainSubjects: Array<MainSubject> = mainSubjectsNorwegian.map((m) => {
    const titles: Array<Title> | null = getTitlesBySubjectName(mainSubjectsAll, m.name)
    const subSubjects: Array<SubSubject> = getSubSubjectsByMainSubjectPath(subSubjectsAll, statistics, m.path)

    return {
      subjectCode: m.subjectCode ? m.subjectCode : '',
      name: m.name,
      titles: titles ? titles : [],
      subSubjects: subSubjects
    }
  })
  return mainSubjects
}

export interface SubjectItem {
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
    statistics: Array<StatisticItem>;
}

export interface Title {
    title: string;
    language: string;
}

export interface StatisticItem {
    name: string;
    path: string;
    language: string;
    shortName: string;
    isPrimaryLocated: boolean;
    titles: Array<Title>;
}

export interface SubjectUtilsLib {
    getMainSubjects: () => Array<SubjectItem>;
    getSubSubjects: () => Array<SubjectItem>;
    getSubjectsByLanguage: (mainsubjects: Array<SubjectItem>, language: string) => Array<SubjectItem>;
    getSubSubjectsByPath: (subSubjects: Array<SubjectItem>, path: string) => Array<SubjectItem>;
    getTitlesBySubjectName: (subjects: Array<SubjectItem>, name: string) => Array<Title> | null;
    getSubjectByNameAndLanguage: (subsubjects: Array<SubjectItem>, language: string, name: string) => SubjectItem;
    getSubSubjectsByMainSubjectPath: (subjects: Array<SubjectItem>, statistics: Array<StatisticItem>, path: string) => Array<SubSubject>;
    getStatistics: () => Array<StatisticItem>;
    getStatisticsByPath: (statistics: Array<StatisticItem>, path: string) => Array<StatisticItem>;
    getSubjectStructur: (language: string) => Array<MainSubject>;
  }

