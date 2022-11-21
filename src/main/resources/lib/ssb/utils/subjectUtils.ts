import { type Content, query } from '/lib/xp/content'
import type { Statistics } from '../../../site/content-types/statistics/statistics'
import type { EndedStatisticList } from '../../../site/content-types/endedStatisticList/endedStatisticList'
import type { StatisticInListing } from '../dashboard/statreg/types'
import type { Statistic } from '../../../site/mixins/statistic/statistic'
import type { Subtopic } from '../../../site/mixins/subtopic/subtopic'
import type { DefaultPage } from '/lib/types/defaultPage'
import { Article } from '../../../site/content-types/article/article'
import { forceArray } from '/lib/ssb/utils/arrayUtils'
import { fromSubjectCache } from '/lib/ssb/cache/subjectCache'

const { getAllStatisticsFromRepo } = __non_webpack_require__('/lib/ssb/statreg/statistics')
const { ensureArray } = __non_webpack_require__('/lib/ssb/utils/arrayUtils')
const { parentPath } = __non_webpack_require__('/lib/ssb/utils/parentUtils')

export function getMainSubjects(request: XP.Request, language?: string): Array<SubjectItem> {
  return fromSubjectCache<SubjectItem>(request, `mainsubject-${language ? language : 'all'}`, () =>
    queryForMainSubjects({
      language,
    })
  )
}

export function queryForMainSubjects({ language }: QueryForSubjectsParams): SubjectItem[] {
  return query({
    count: 200,
    sort: 'displayName ASC',
    filters: {
      boolean: {
        must: [
          {
            hasValue: {
              field: 'language',
              values: language === 'en' ? ['en'] : ['no', 'nb', 'nn'],
            },
          },
          {
            hasValue: {
              field: 'components.page.config.mimir.default.subjectType',
              values: ['mainSubject'],
            },
          },
        ],
      },
    },
  })
    .hits.filter((hit) => {
      const page: DefaultPage['page'] = hit.page as DefaultPage['page']
      return page.config.subjectCode !== undefined
    })
    .map((hit) => {
      const page: DefaultPage['page'] = hit.page as DefaultPage['page']

      return {
        id: hit._id,
        title: hit.displayName,
        subjectCode: page.config.subjectCode,
        path: hit._path,
        language: hit?.language === 'en' ? 'en' : 'no',
        name: hit._name,
      }
    })
}

export function queryForSubSubjects({ language }: QueryForSubjectsParams): SubjectItem[] {
  return query({
    count: 200,
    sort: 'displayName ASC',
    filters: {
      boolean: {
        must: [
          {
            hasValue: {
              field: 'language',
              values: language === 'en' ? ['en'] : ['no', 'nb', 'nn'],
            },
          },
          {
            hasValue: {
              field: 'components.page.config.mimir.default.subjectType',
              values: ['subSubject'],
            },
          },
        ],
      },
    },
  })
    .hits.filter((hit) => {
      const page: DefaultPage['page'] = hit.page as DefaultPage['page']
      return page.config.subjectCode !== undefined
    })
    .map((hit) => {
      const page: DefaultPage['page'] = hit.page as DefaultPage['page']

      return {
        id: hit._id,
        title: hit.displayName,
        subjectCode: page.config.subjectCode,
        path: hit._path,
        language: hit?.language === 'en' ? 'en' : 'no',
        name: hit._name,
      }
    })
}

interface QueryForSubjectsParams {
  language?: string | undefined
}

export function getMainSubjectById(mainSubjects: Array<SubjectItem>, id: string): SubjectItem | null {
  const mainSubjectFiltered: Array<SubjectItem> = mainSubjects.filter((mainsubject) => mainsubject.id === id)

  if (mainSubjectFiltered.length > 0) {
    return mainSubjectFiltered[0]
  }

  return null
}

export function getSubSubjects(request: XP.Request, language?: string): Array<SubjectItem> {
  return fromSubjectCache<SubjectItem>(request, `subsubject-${language ? language : 'all'}`, () => {
    const lang: string = language ? (language !== 'en' ? 'AND language != "en"' : 'AND language = "en"') : ''
    const subSubjectsContent: Array<DefaultPage> = query({
      start: 0,
      count: 1000,
      sort: 'displayName ASC',
      query: `components.page.config.mimir.default.subjectType LIKE "subSubject" ${lang}`,
    }).hits as unknown as Array<DefaultPage>

    return subSubjectsContent.map((m) => ({
      id: m._id,
      title: m.displayName,
      subjectCode:
        typeof m.page.config === 'object' && m.page.config && m.page.config.subjectCode
          ? m.page.config.subjectCode
          : '',
      path: m._path,
      language: m.language && m.language === 'en' ? 'en' : 'no',
      name: m._name,
    }))
  })
}

export function getSecondaryMainSubject(
  subtopicsContent: Array<string>,
  mainSubjects: Array<SubjectItem>,
  subSubjects: Array<SubjectItem>
): Array<SubjectItem> {
  const secondaryMainSubjects: Array<SubjectItem> = subtopicsContent.reduce(
    (acc: Array<SubjectItem>, topic: string) => {
      const subSubject: SubjectItem = subSubjects.filter((subSubject) => subSubject.id === topic)[0]
      if (subSubject) {
        const mainSubject: SubjectItem | undefined = getMainSubjectBySubSubject(subSubject, mainSubjects)
        if (mainSubject && !acc.includes(mainSubject)) {
          acc.push(mainSubject)
        }
      }
      return acc
    },
    []
  )
  return secondaryMainSubjects
}

export function getSecondarySubSubject(
  subtopicsContent: Array<string>,
  subSubjects: Array<SubjectItem>
): Array<SubjectItem> {
  const secondarySubSubjects: Array<SubjectItem> = subtopicsContent.reduce((acc: Array<SubjectItem>, topic: string) => {
    const subSubject: SubjectItem = subSubjects.filter((subSubject) => subSubject.id === topic)[0]
    if (subSubject && !acc.includes(subSubject)) {
      acc.push(subSubject)
    }
    return acc
  }, [])
  return secondarySubSubjects
}

export function getAllMainSubjectByContent(
  content: Content<Statistics | Article>,
  mainSubjects: Array<SubjectItem>,
  subSubjects: Array<SubjectItem>
): Array<SubjectItem> {
  const mainSubject: SubjectItem[] = mainSubjects.filter((subject) => content?._path.startsWith(subject.path))
  const subTopics: Array<string> = content?.data.subtopic ? forceArray(content.data.subtopic) : []
  const secondaryMainSubject: SubjectItem[] = subTopics
    ? getSecondaryMainSubject(subTopics, mainSubjects, subSubjects)
    : []
  const allMainSubjects: SubjectItem[] = mainSubject.concat(
    secondaryMainSubject.filter((item) => mainSubject.indexOf(item) < 0)
  )

  return allMainSubjects
}

export function getAllSubSubjectByContent(
  content: Content<Statistics | Article>,
  subSubjects: Array<SubjectItem>
): Array<SubjectItem> {
  const subSubject: SubjectItem[] = subSubjects.filter((subject) => content?._path.startsWith(subject.path))
  const subTopics: Array<string> = content?.data.subtopic ? forceArray(content.data.subtopic) : []
  const secondarySubSubject: SubjectItem[] = subTopics ? getSecondarySubSubject(subTopics, subSubjects) : []
  const allSubSubjects: SubjectItem[] = subSubject.concat(
    secondarySubSubject.filter((item) => subSubject.indexOf(item) < 0)
  )
  return allSubSubjects
}

function getSubjectsByLanguage(subjects: Array<SubjectItem>, language: string): Array<SubjectItem> {
  return subjects.filter((subject) => subject.language === language)
}

function getSubjectByNameAndLanguage(subjects: Array<SubjectItem>, language: string, name: string): SubjectItem | null {
  const subjectsFiltered: Array<SubjectItem> = subjects.filter(
    (subject) => subject.language === language && subject.name === name
  )

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
      language: 'no',
    })
  }

  if (subjectEnglish) {
    titles.push({
      title: subjectEnglish.title,
      language: 'en',
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
  path: string
): Array<SubSubject> {
  const subSubjectsPath: Array<SubjectItem> = getSubSubjectsByPath(subjects, path)

  return subSubjectsPath.map((s) => {
    const endedStatistics: Array<StatisticItem> = getEndedStatisticsByPath(s.path, statregStatistics, false)
    const secondaryStatistics: Array<StatisticItem> = getSecondaryStatisticsBySubject(statistics, s)
    const allStatistics: Array<StatisticItem> = [
      ...getStatisticsByPath(statistics, s.path),
      ...endedStatistics,
      ...secondaryStatistics,
    ]
    const titles: Array<Title> = ensureArray(getTitlesBySubjectName(subjects, s.name))

    return {
      id: s.id,
      subjectCode: s.subjectCode ? s.subjectCode : '',
      name: s.name,
      titles,
      statistics: allStatistics,
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
    query: `data.statistic LIKE '*'`,
  }).hits as unknown as Array<Content<Statistics>>

  if (statregStatistics.length > 0) {
    statisticContent.forEach((statistic: Content<Statistics & Statistic & Subtopic>) => {
      const statreg: StatisticInListing | undefined = statregStatistics.find(
        (s) => s.id.toString() === statistic.data.statistic
      )
      if (statreg) {
        const titles: Array<Title> = [
          {
            title: statreg.name,
            language: 'no',
          },
          {
            title: statreg.nameEN,
            language: 'en',
          },
        ]

        statistics.push({
          path: statistic._path,
          language: statistic.language === 'en' ? 'en' : 'no',
          shortName: statreg.shortName,
          isPrimaryLocated: true,
          titles,
          hideFromList: statistic.data.hideFromList ? statistic.data.hideFromList : false,
          secondarySubject: statistic.data.subtopic ? ensureArray(statistic.data.subtopic) : [],
        })
      }
    })
  }

  return statistics
}

export function getEndedStatisticsByPath(
  path: string,
  statregStatistics: Array<StatisticInListing>,
  hideStatistics: boolean
): Array<StatisticItem> {
  const statistics: Array<StatisticItem> = []
  const statisticList: Content<EndedStatisticList> = query({
    start: 0,
    count: 1,
    query: `_path LIKE "/content${path}*"`,
    contentTypes: [`${app.name}:endedStatisticList`],
  }).hits[0]
  const endedStatistics: Array<EndedStatistic> =
    statisticList && statisticList.data.endedStatistics ? ensureArray(statisticList.data.endedStatistics) : []
  const endedStatisticsFiltered: Array<EndedStatistic> = hideStatistics
    ? endedStatistics.filter((e) => e.hideFromList === false)
    : endedStatistics

  if (endedStatisticsFiltered.length > 0 && statregStatistics.length > 0) {
    endedStatisticsFiltered.forEach((endedStatistic: EndedStatistic) => {
      const statreg: StatisticInListing | undefined = statregStatistics.find(
        (s) => s.id.toString() === endedStatistic.statistic
      )
      if (statreg) {
        const titles: Array<Title> = [
          {
            title: statreg.name,
            language: 'no',
          },
          {
            title: statreg.nameEN,
            language: 'en',
          },
        ]

        statistics.push({
          path: path,
          language: 'no',
          shortName: statreg.shortName,
          isPrimaryLocated: true,
          titles: titles,
          hideFromList: hideStatistics,
          secondarySubject: [],
        })
      }
    })
  }

  return statistics
}

export function getStatisticsByPath(statistics: Array<StatisticItem>, path: string): Array<StatisticItem> {
  return statistics.filter((s: StatisticItem) => s.path.startsWith(path))
}

export function getSecondaryStatisticsBySubject(
  statistics: Array<StatisticItem>,
  subject: SubjectItem
): Array<StatisticItem> {
  return statistics
    .filter((statistic) => statistic.secondarySubject.includes(subject.id))
    .map((s) => {
      return {
        ...s,
        isPrimaryLocated: false,
      }
    })
}

export function getSubjectStructur(request: XP.Request, language: string): Array<MainSubject> {
  const mainSubjectsAll: Array<SubjectItem> = getMainSubjects(request)
  const subSubjectsAll: Array<SubjectItem> = getSubSubjects(request)
  const statregStatistics: Array<StatisticInListing> = ensureArray(getAllStatisticsFromRepo())
  const statistics: Array<StatisticItem> = getStatistics(statregStatistics)
  const mainSubjectsLanguage: Array<SubjectItem> = getSubjectsByLanguage(mainSubjectsAll, language)

  const mainSubjects: Array<MainSubject> = mainSubjectsLanguage.map((m) => {
    const titles: Array<Title> | null = getTitlesBySubjectName(mainSubjectsAll, m.name)
    const subSubjects: Array<SubSubject> = getSubSubjectsByMainSubjectPath(
      subSubjectsAll,
      statistics,
      statregStatistics,
      m.path
    )

    return {
      subjectCode: m.subjectCode ? m.subjectCode : '',
      name: m.name,
      titles: titles ? titles : [],
      subSubjects: subSubjects,
    }
  })
  return mainSubjects
}

export function getMainSubjectBySubSubject(
  subSubject: SubjectItem,
  mainSubjects: Array<SubjectItem>
): SubjectItem | undefined {
  return mainSubjects.find((mainSubject) => mainSubject.path === parentPath(subSubject.path))
}

export interface SubjectItem {
  id: string
  title: string
  subjectCode?: string
  path: string
  language: string
  name: string
}

export interface MainSubject {
  subjectCode: string
  name: string
  titles: Array<Title>
  subSubjects: Array<SubSubject>
}

export interface SubSubject {
  id: string
  subjectCode: string
  name: string
  titles: Array<Title>
  statistics: Array<StatisticItem>
}

export interface Title {
  title: string
  language: string
}

export interface StatisticItem {
  path: string
  language: string
  shortName: string
  isPrimaryLocated: boolean
  titles: Array<Title>
  hideFromList: boolean
  secondarySubject: Array<string>
}

interface EndedStatistic {
  statistic?: string
  hideFromList: boolean
}

export type SubjectUtilsLib = typeof import('./subjectUtils')
