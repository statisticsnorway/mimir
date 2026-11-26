import { type Request } from '@enonic-types/core'
import { type Content, query } from '/lib/xp/content'
import { type StatisticInListing } from '/lib/ssb/dashboard/statreg/types'
import { type DefaultPage } from '/lib/types/defaultPage'
import { fromSubjectCache } from '/lib/ssb/cache/subjectCache'
import { forceArray, ensureArray } from '/lib/ssb/utils/arrayUtils'

import {
  fetchStatisticsFromStatregAPI,
  getAllStatisticsFromRepo,
  getStatisticByShortNameFromRepo,
  type StatisticListingResponse,
} from '/lib/ssb/statreg/statistics'
import { parentPath } from '/lib/ssb/utils/parentUtils'
import {
  type EndedStatistic,
  type MainSubject,
  type StatisticItem,
  type SubSubject,
  type SubjectItem,
  type Title,
} from '/lib/types/subject'
import { type Subtopic } from '/site/mixins/subtopic'
import { type Statistic } from '/site/mixins/statistic'
import { type Article, type EndedStatisticList, type Statistics } from '/site/content-types'

export type StatregApiStatistic = NonNullable<StatisticListingResponse['statistics']>[number] & { shortname: string }
export type SubjectStatistic = StatisticInListing | StatregApiStatistic

export function getMainSubjects(request: Request, language?: string): Array<SubjectItem> {
  return fromSubjectCache<SubjectItem>(request, `mainsubject-${language ?? 'all'}`, () =>
    queryForSubjects({
      language,
      subjectType: 'mainSubject',
    })
  )
}

export function queryForSubjects({ language, subjectType }: QueryForSubjectsParams): SubjectItem[] {
  return query({
    count: 200,
    sort: 'displayName ASC',
    filters: {
      boolean: {
        must: [
          {
            hasValue: {
              field: 'language',
              values: getLanguageValues(language),
            },
          },
          {
            hasValue: {
              field: 'components.page.config.mimir.default.subjectType',
              values: [subjectType],
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

function getLanguageValues(language: string | undefined): string[] {
  if (language) {
    return language === 'en' ? ['en'] : ['no', 'nb', 'nn']
  } else {
    return ['no', 'nb', 'nn', 'en']
  }
}

interface QueryForSubjectsParams {
  language?: string | undefined
  subjectType: string
}

export function getMainSubjectById(mainSubjects: Array<SubjectItem>, id: string): SubjectItem | null {
  const mainSubjectFiltered: Array<SubjectItem> = mainSubjects.filter((mainsubject) => mainsubject.id === id)

  if (mainSubjectFiltered.length > 0) {
    return mainSubjectFiltered[0]
  }

  return null
}

export function getSubSubjects(request: Request, language?: string): Array<SubjectItem> {
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
  const mainSubject: SubjectItem[] = content?._path ? getSubjectsByPath(mainSubjects, content._path) : []
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
  const subSubject: SubjectItem[] = content?._path ? getSubjectsByPath(subSubjects, content._path) : []
  const subTopics: Array<string> = content?.data.subtopic ? forceArray(content.data.subtopic) : []
  const secondarySubSubject: SubjectItem[] = subTopics ? getSecondarySubSubject(subTopics, subSubjects) : []
  const allSubSubjects: SubjectItem[] = subSubject.concat(
    secondarySubSubject.filter((item) => subSubject.indexOf(item) < 0)
  )
  return allSubSubjects
}

function getSubjectsByPath(subjects: Array<SubjectItem>, path: string): Array<SubjectItem> {
  return subjects.filter((subject) => path.startsWith(subject.path))
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
  statregStatistics: Array<SubjectStatistic>,
  path: string,
  useStatregApi: boolean
): Array<SubSubject> {
  const subSubjectsPath: Array<SubjectItem> = getSubSubjectsByPath(subjects, path)

  return subSubjectsPath.map((s) => {
    const endedStatistics: Array<StatisticItem> = getEndedStatisticsByPath(
      s.path,
      statregStatistics,
      false,
      useStatregApi
    )
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

export function getStatregStatistics(useStatregApi: boolean): Array<SubjectStatistic> {
  if (!useStatregApi) {
    return ensureArray(getAllStatisticsFromRepo())
  }

  const apiStatistics = fetchStatisticsFromStatregAPI({ start: 0, count: 1000 })
  if (!Array.isArray(apiStatistics)) {
    const message = 'Failed to fetch subject structure statistics from Statreg API'
    log.error(message)
    throw new Error(message)
  }
  if (!apiStatistics.every((statistic): statistic is StatregApiStatistic => Boolean(statistic.shortname))) {
    const message = 'Statreg API returned a subject structure statistic without a data.shortname'
    log.error(message)
    throw new Error(message)
  }
  return apiStatistics
}

export function getStatistics(
  statregStatistics: Array<SubjectStatistic>,
  useStatregApi: boolean = false
): Array<StatisticItem> {
  const statistics: Array<StatisticItem> = []
  const statisticContent: Array<Content<Statistics>> = query({
    start: 0,
    count: 2000,
    contentTypes: [`${app.name}:statistics`],
    sort: 'displayName ASC',
    query: useStatregApi ? `data.shortname LIKE '*'` : `data.statistic LIKE '*'`,
  }).hits as unknown as Array<Content<Statistics>>

  if (statregStatistics.length > 0) {
    statisticContent.forEach((statistic: Content<Statistics & Statistic & Subtopic>) => {
      const statreg = statregStatistics.find((s) =>
        useStatregApi
          ? 'shortname' in s && s.shortname === statistic.data.shortname
          : 'id' in s && s.id.toString() === statistic.data.statistic
      )
      if (statreg) {
        statistics.push({
          path: statistic._path,
          language: statistic.language === 'en' ? 'en' : 'no',
          shortName: 'shortName' in statreg ? statreg.shortName : statreg.shortname,
          isPrimaryLocated: true,
          titles: getStatisticTitles(statreg),
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
  statregStatistics: Array<SubjectStatistic>,
  hideStatistics: boolean,
  useStatregApi: boolean = false
): Array<StatisticItem> {
  const statistics: Array<StatisticItem> = []
  let endedStatistics: Array<EndedStatistic> = []
  const statisticList: Content<EndedStatisticList> = query({
    start: 0,
    count: 1,
    query: `_path LIKE "/content${path}*"`,
    contentTypes: [`${app.name}:endedStatisticList`],
  }).hits[0]

  if (useStatregApi) {
    if (statisticList && !statisticList.data.endedStatisticsAPI) {
      log.warning(
        'No StatregAPI data added to ended statistic "%s" on path "%s"',
        statisticList.data.endedStatistics,
        path
      )
    }
    endedStatistics =
      statisticList && statisticList.data.endedStatisticsAPI ? ensureArray(statisticList.data.endedStatisticsAPI) : []
  } else {
    endedStatistics =
      statisticList && statisticList.data.endedStatistics ? ensureArray(statisticList.data.endedStatistics) : []
  }
  const endedStatisticsFiltered: Array<EndedStatistic> = hideStatistics
    ? endedStatistics.filter((e) => e.hideFromList === false)
    : endedStatistics
  if (endedStatisticsFiltered.length > 0 && statregStatistics.length > 0) {
    endedStatisticsFiltered.forEach((endedStatistic: EndedStatistic) => {
      // TODO: MIM-3294: Fix shortname for endedStatistic content type and parts
      const statreg = useStatregApi
        ? statregStatistics.find((s) => 'shortname' in s && s.shortname === endedStatistic.statistic)
        : statregStatistics.find((s) => 'id' in s && s.id.toString() === endedStatistic.statistic)
      if (statreg) {
        statistics.push({
          path: path,
          language: 'no',
          shortName: 'shortName' in statreg ? statreg.shortName : statreg.shortname,
          isPrimaryLocated: true,
          titles: getStatisticTitles(statreg),
          hideFromList: hideStatistics,
          secondarySubject: [],
        })
      } else if (useStatregApi) {
        log.warning(
          'No Statreg API statistic found for ended statistic "%s" under "%s"',
          endedStatistic.statistic,
          path
        )
      }
    })
  }

  return statistics
}

function getStatisticTitles(statistic: SubjectStatistic): Array<Title> {
  const titles: Array<Title> = []
  const nameEN = 'shortName' in statistic ? statistic.nameEN : statistic.name_en
  if (statistic.name !== undefined) {
    titles.push({ title: statistic.name, language: 'no' })
  }
  if (nameEN !== undefined) {
    titles.push({ title: nameEN, language: 'en' })
  }
  return titles
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

export function getSubjectStructur(request: Request, language: string, useStatregApi: boolean): Array<MainSubject> {
  const mainSubjectsAll: Array<SubjectItem> = getMainSubjects(request)
  const subSubjectsAll: Array<SubjectItem> = getSubSubjects(request)

  const statregStatistics = getStatregStatistics(useStatregApi)
  const statistics: Array<StatisticItem> = getStatistics(statregStatistics, useStatregApi)
  const mainSubjectsLanguage: Array<SubjectItem> = getSubjectsByLanguage(mainSubjectsAll, language)

  const mainSubjects: Array<MainSubject> = mainSubjectsLanguage.map((m) => {
    const titles: Array<Title> | null = getTitlesBySubjectName(mainSubjectsAll, m.name)
    const subSubjects: Array<SubSubject> = getSubSubjectsByMainSubjectPath(
      subSubjectsAll,
      statistics,
      statregStatistics,
      m.path,
      useStatregApi
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
