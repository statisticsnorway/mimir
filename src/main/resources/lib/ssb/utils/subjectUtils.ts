import { Content } from 'enonic-types/content'
import { Page } from '../../../site/content-types/page/page'
import { DefaultPageConfig } from '../../../site/pages/default/default-page-config'
import { Statistics } from '../../../site/content-types/statistics/statistics'
import { StatisticList } from '../../../site/content-types/statisticList/statisticList'
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


export function getMainSubjects(language?: string): Array<SubjectItem> {
  const lang: string = language ? `AND language = "${language}"` : ''
  const mainSubjectsContent: Array<Content<Page, DefaultPageConfig>> = query({
    start: 0,
    count: 200,
    sort: 'displayName ASC',
    query: `components.page.config.mimir.default.subjectType LIKE "mainSubject" ${lang}`
  }).hits as unknown as Array<Content<Page, DefaultPageConfig>>

  return mainSubjectsContent.map((m) =>({
    title: m.displayName,
    subjectCode: m.page.config.subjectCode ? m.page.config.subjectCode : '',
    path: m._path,
    language: m.language && m.language === 'en' ? 'en' : 'no',
    name: m._name
  }))
}

export function getSubSubjects(language?: string): Array<SubjectItem> {
  const lang: string = language ? `AND language = "${language}"` : ''
  const subSubjectsContent: Array<Content<Page, DefaultPageConfig>> = query({
    start: 0,
    count: 1000,
    sort: 'displayName ASC',
    query: `components.page.config.mimir.default.subjectType LIKE "subSubject" ${lang}`
  }).hits as unknown as Array<Content<Page, DefaultPageConfig>>

  return subSubjectsContent.map((m) => ({
    title: m.displayName,
    subjectCode: m.page.config.subjectCode ? m.page.config.subjectCode : '',
    path: m._path,
    language: m.language && m.language === 'en' ? 'en' : 'no',
    name: m._name
  }))
}

export function getSubjectsByLanguage(subjects: Array<SubjectItem>, language: string): Array<SubjectItem> {
  return subjects.filter((subject) =>
    subject.language === language)
}

export function getSubjectByNameAndLanguage(subjects: Array<SubjectItem>, language: string, name: string): SubjectItem | null {
  const subjectsFiltered: Array<SubjectItem> = subjects.filter((subject) =>
    subject.language === language && subject.name === name)

  if (subjectsFiltered.length > 0) {
    return subjectsFiltered[0]
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

export function getSubSubjectsByPath(subjects: Array<SubjectItem>, path: string): Array<SubjectItem> {
  return subjects.filter((subject) => subject.path.startsWith(path))
}

export function getSubSubjectsByMainSubjectPath(
  subjects: Array<SubjectItem>,
  statistics: Array<StatisticItem>,
  statregStatistics: Array<StatisticInListing>,
  path: string): Array<SubSubject> {
  const subSubjectsPath: Array<SubjectItem> = getSubSubjectsByPath(subjects, path)

  return subSubjectsPath.map((s) => {
    const endedStatistics: Array<StatisticItem> = getEndedStatisticsByPath(s.path, statregStatistics)

    const titles: Array<Title> | null = getTitlesBySubjectName(subjects, s.name)
    return {
      subjectCode: s.subjectCode ? s.subjectCode : '',
      name: s.name,
      titles: titles ? titles : [],
      statistics: [...getStatisticsByPath(statistics, s.path), ...endedStatistics]
    }
  })
}

export function getEndedStatisticsByPath(path: string, statregStatistics: Array<StatisticInListing>): Array<StatisticItem> {
  const statisticList: Content<StatisticList> = query({
    start: 0,
    count: 1,
    query: `_path LIKE "/content${path}*"`,
    contentTypes: [`${app.name}:statisticList`]
  }).hits[0]

  const endedStatistic: Array<string| undefined> = statisticList ? ensureArray(statisticList.data.statistic) : []

  const statistics: Array<StatisticItem> = endedStatistic.length > 0 && statregStatistics.length > 0 ? endedStatistic.map((statistic: string) => {
    const statreg: StatisticInListing | undefined = statregStatistics.find((s) => s.id.toString() === statistic)

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
        name: statreg ? statreg.name : '',
        path: path,
        language: 'no',
        shortName: statreg ? statreg.shortName : '',
        isPrimaryLocated: true,
        titles: titles
      }
    )
  }) : []

  return statistics
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
  const statregStatistics: Array<StatisticInListing> = ensureArray(getAllStatisticsFromRepo())
  const mainSubjectsLanguage: Array<SubjectItem> = getSubjectsByLanguage(mainSubjectsAll, language)

  const mainSubjects: Array<MainSubject> = mainSubjectsLanguage.map((m) => {
    const titles: Array<Title> | null = getTitlesBySubjectName(mainSubjectsAll, m.name)
    const subSubjects: Array<SubSubject> = getSubSubjectsByMainSubjectPath(subSubjectsAll, statistics, statregStatistics, m.path)

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
    subjectCode: string;
    name: string;
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
    getMainSubjects: (language?: string) => Array<SubjectItem>;
    getSubSubjects: (language?: string) => Array<SubjectItem>;
    getSubjectsByLanguage: (subjects: Array<SubjectItem>, language: string) => Array<SubjectItem>;
    getSubSubjectsByPath: (subjects: Array<SubjectItem>, path: string) => Array<SubjectItem>;
    getTitlesBySubjectName: (subjects: Array<SubjectItem>, name: string) => Array<Title> | null;
    getSubjectByNameAndLanguage: (subjects: Array<SubjectItem>, language: string, name: string) => SubjectItem;
    getSubSubjectsByMainSubjectPath: (subjects: Array<SubjectItem>, statistics: Array<StatisticItem>, statregStatistics: Array<StatisticInListing>, path: string) => Array<SubSubject>;
    getStatistics: () => Array<StatisticItem>;
    getStatisticsByPath: (statistics: Array<StatisticItem>, path: string) => Array<StatisticItem>;
    getSubjectStructur: (language: string) => Array<MainSubject>;
    getEndedStatisticsByPath: (path: string, statregStatistics: Array<StatisticInListing>) => Array<StatisticItem>;
  }

