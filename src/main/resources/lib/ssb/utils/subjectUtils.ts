import { Content } from 'enonic-types/content'
import { Page } from '../../../site/content-types/page/page'
import { DefaultPageConfig } from '../../../site/pages/default/default-page-config'
import { Statistics } from '../../../site/content-types/statistics/statistics'
import { EndedStatisticList } from '../../../site/content-types/endedStatisticList/endedStatisticList'
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
  // Todo: Må sjekke om noen hovedemner kan være på nynorsk
  const lang: string = language ? `AND language = "${language}"` : ''
  const mainSubjectsContent: Array<Content<Page, DefaultPageConfig>> = query({
    start: 0,
    count: 200,
    sort: 'displayName ASC',
    query: `components.page.config.mimir.default.subjectType LIKE "mainSubject" ${lang}`
  }).hits as unknown as Array<Content<Page, DefaultPageConfig>>

  return mainSubjectsContent.map((m) =>({
    id: m._id,
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
    id: m._id,
    title: m.displayName,
    subjectCode: m.page.config.subjectCode ? m.page.config.subjectCode : '',
    path: m._path,
    language: m.language && m.language === 'en' ? 'en' : 'no',
    name: m._name
  }))
}

function getSubjectsByLanguage(subjects: Array<SubjectItem>, language: string): Array<SubjectItem> {
  return subjects.filter((subject) =>
    subject.language === language)
}

function getSubjectByNameAndLanguage(subjects: Array<SubjectItem>, language: string, name: string): SubjectItem | null {
  const subjectsFiltered: Array<SubjectItem> = subjects.filter((subject) =>
    subject.language === language && subject.name === name)

  if (subjectsFiltered.length > 0) {
    return subjectsFiltered[0]
  }

  return null
}

function getTitlesBySubjectName(subjects: Array<SubjectItem>, name: string): Array<Title> | null {
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

function getSubSubjectsByMainSubjectPath(
  subjects: Array<SubjectItem>,
  statistics: Array<StatisticItem>,
  statregStatistics: Array<StatisticInListing>,
  path: string): Array<SubSubject> {
  const subSubjectsPath: Array<SubjectItem> = getSubSubjectsByPath(subjects, path)

  return subSubjectsPath.map((s) => {
    const endedStatistics: Array<StatisticItem> = getEndedStatisticsByPath(s.path, statregStatistics, false)
    const secondaryStatistics: Array<StatisticItem> = getSecondaryStatisticsBySubject(statistics, s)
    const allStatistics: Array<StatisticItem> = [...getStatisticsByPath(statistics, s.path), ...endedStatistics, ...secondaryStatistics]
    const titles: Array<Title> = ensureArray(getTitlesBySubjectName(subjects, s.name))

    return {
      id: s.id,
      subjectCode: s.subjectCode ? s.subjectCode : '',
      name: s.name,
      titles,
      statistics: allStatistics
    }
  })
}

export function getStatistics(statregStatistics: Array<StatisticInListing>): Array<StatisticItem> {
  const statistics: Array<StatisticItem> = []
  const statisticContent: Array<Content<Statistics>> = query({
    start: 0,
    count: 2000,
    contentTypes: [`${app.name}:statistics`],
    sort: 'displayName ASC',
    query: `data.statistic LIKE '*'`
  }).hits as unknown as Array<Content<Statistics>>

  if (statregStatistics.length > 0) {
    statisticContent.forEach((statistic: Content<Statistics>) => {
      const statreg: StatisticInListing | undefined = statregStatistics.find((s) => s.id.toString() === statistic.data.statistic)
      if (statreg) {
        const titles: Array<Title> = [{
          title: statreg.name,
          language: 'no'
        },
        {
          title: statreg.nameEN,
          language: 'en'
        }]

        statistics.push(
          {
            path: statistic._path,
            language: statistic.language === 'en' ? 'en' : 'no',
            shortName: statreg.shortName,
            isPrimaryLocated: true,
            titles,
            hideFromList: statistic.data.hideFromList ? statistic.data.hideFromList : false,
            secondarySubject: statistic.data.subtopic ? ensureArray(statistic.data.subtopic) : []
          }
        )
      }
    })
  }

  return statistics
}

export function getEndedStatisticsByPath(path: string, statregStatistics: Array<StatisticInListing>, hideStatistics: boolean): Array<StatisticItem> {
  const statistics: Array<StatisticItem> = []
  const statisticList: Content<EndedStatisticList> = query({
    start: 0,
    count: 1,
    query: `_path LIKE "/content${path}*"`,
    contentTypes: [`${app.name}:endedStatisticList`]
  }).hits[0]
  const endedStatistics: Array<EndedStatistic> = statisticList && statisticList.data.endedStatistics ?
    ensureArray(statisticList.data.endedStatistics) : []
  const endedStatisticsFiltered: Array<EndedStatistic> = hideStatistics ?
    endedStatistics.filter((e) => e.hideFromList === false) : endedStatistics

  if (endedStatisticsFiltered.length > 0 && statregStatistics.length > 0 ) {
    endedStatisticsFiltered.forEach((endedStatistic: EndedStatistic) => {
      const statreg: StatisticInListing | undefined = statregStatistics.find((s) => s.id.toString() === endedStatistic.statistic)
      if (statreg) {
        const titles: Array<Title> = [{
          title: statreg.name,
          language: 'no'
        },
        {
          title: statreg.nameEN,
          language: 'en'
        }]

        statistics.push(
          {
            path: path,
            language: 'no',
            shortName: statreg.shortName,
            isPrimaryLocated: true,
            titles: titles,
            hideFromList: hideStatistics,
            secondarySubject: []
          }
        )
      }
    })
  }

  return statistics
}

export function getStatisticsByPath(statistics: Array<StatisticItem>, path: string): Array<StatisticItem> {
  return statistics.filter((s: StatisticItem) => s.path.startsWith(path))
}

export function getSecondaryStatisticsBySubject(statistics: Array<StatisticItem>, subject: SubjectItem): Array<StatisticItem> {
  return statistics.filter((statistic) => statistic.secondarySubject.includes(subject.id)).map((s) => {
    return {
      ...s,
      isPrimaryLocated: false
    }
  })
}

export function getSubjectStructur(language: string): Array<MainSubject> {
  const mainSubjectsAll: Array<SubjectItem> = getMainSubjects()
  const subSubjectsAll: Array<SubjectItem> = getSubSubjects()
  const statregStatistics: Array<StatisticInListing> = ensureArray(getAllStatisticsFromRepo())
  const statistics: Array<StatisticItem> = getStatistics(statregStatistics)
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
  id: string;
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
    id: string;
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
    path: string;
    language: string;
    shortName: string;
    isPrimaryLocated: boolean;
    titles: Array<Title>;
    hideFromList: boolean;
    secondarySubject: Array<string>;
}

interface EndedStatistic {
  statistic?: string;
  hideFromList: boolean;
}

export interface SubjectUtilsLib {
    getMainSubjects: (language?: string) => Array<SubjectItem>;
    getSubSubjects: (language?: string) => Array<SubjectItem>;
    getSubSubjectsByPath: (subjects: Array<SubjectItem>, path: string) => Array<SubjectItem>;
    getSubjectStructur: (language: string) => Array<MainSubject>;
    getStatistics: (statregStatistics: Array<StatisticInListing>) => Array<StatisticItem>;
    getStatisticsByPath: (statistics: Array<StatisticItem>, path: string) => Array<StatisticItem>;
    getEndedStatisticsByPath: (path: string, statregStatistics: Array<StatisticInListing>, hideStatistics: boolean) => Array<StatisticItem>;
    getSecondaryStatisticsBySubject: (statistics: Array<StatisticItem>, subject: SubjectItem) => Array<StatisticItem>;
  }

