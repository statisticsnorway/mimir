import { create as createRepo, get as getRepo } from '/lib/xp/repo'
import { connect, type NodeCreateParams, type NodeQueryResponse, type RepoConnection } from '/lib/xp/node'
import { type Instant, instant, type LocalDateTime, localDateTime } from '/lib/xp/value'
import { run } from '/lib/xp/context'
import { getAllStatisticsFromRepo } from '/lib/ssb/statreg/statistics'
import { contentArrayToRecord, forceArray } from '/lib/ssb/utils/arrayUtils'
import { notEmptyOrUndefined, notNullOrUndefined } from '/lib/ssb/utils/coreUtils'
import type { StatisticInListing, VariantInListing } from '/lib/ssb/dashboard/statreg/types'
import { type Content, query, type QueryResponse } from '/lib/xp/content'
import type { OmStatistikken } from '../../../site/content-types/omStatistikken/omStatistikken'
import type { XData } from '../../../site/x-data'
import type { Statistics } from '../../../site/content-types/statistics/statistics'
import { capitalize } from '/lib/ssb/utils/stringUtils'
import { calculatePeriod, getNextRelease, getPreviousRelease, nextReleasedPassed } from '/lib/ssb/utils/variantUtils'
import type { SubjectItem } from '/lib/ssb/utils/subjectUtils'
import type { QueryDSL } from '/lib/xp/content'

const { queryForMainSubjects, queryForSubSubjects, getAllMainSubjectByContent, getAllSubSubjectByContent } =
  __non_webpack_require__('/lib/ssb/utils/subjectUtils')

export const REPO_ID_STATISTICS: 'no.ssb.statistics' = 'no.ssb.statistics' as const

const LANGUAGES: ReadonlyArray<'en' | 'nb'> = ['nb', 'en'] as const

export function createOrUpdateStatisticsNewRepo(): void {
  log.info(`Initiating "${REPO_ID_STATISTICS}"`)
  run(
    {
      user: {
        login: 'su',
        idProvider: 'system',
      },
      branch: 'master',
    },
    () => {
      fillRepoStatistic(getAllStatisticsFromRepo())
      log.info(`Finished initiating "${REPO_ID_STATISTICS}"`)
    }
  )
}

export function getRepoConnectionStatistics(): RepoConnection {
  return connect({
    repoId: REPO_ID_STATISTICS,
    branch: 'master',
  })
}

export function getStatisticsFromRepo(language: string, query?: QueryDSL): ContentLight<Statistic>[] {
  const connectionStatisticRepo: RepoConnection = getRepoConnectionStatistics()
  const res: NodeQueryResponse = connectionStatisticRepo.query({
    count: 1000,
    sort: 'publish.from DESC',
    query: query ? (query as unknown as string) : undefined,
    filters: {
      boolean: {
        must: [
          {
            hasValue: {
              field: 'language',
              values: language === 'nb' ? ['nb', 'nn'] : ['en'],
            },
          },
          {
            hasValue: {
              field: 'data.status',
              values: ['A'],
            },
          },
        ],
      },
    },
  })

  return res.hits.map((hit) => connectionStatisticRepo.get(hit.id))
}

export function fillRepoStatistic(statistics: Array<StatisticInListing>) {
  if (getRepo(REPO_ID_STATISTICS) === null) {
    createRepo({
      id: REPO_ID_STATISTICS,
      rootPermissions: [
        {
          principal: 'role:system.admin',
          allow: ['READ', 'CREATE', 'MODIFY', 'DELETE', 'PUBLISH', 'READ_PERMISSIONS', 'WRITE_PERMISSIONS'],
          deny: [],
        },
        {
          principal: 'role:system.everyone',
          allow: ['READ'],
          deny: [],
        },
      ],
    })
  }

  const connection: RepoConnection = connect({
    repoId: REPO_ID_STATISTICS,
    branch: 'master',
  })

  LANGUAGES.forEach((language) => {
    const allMainSubjects: SubjectItem[] = queryForMainSubjects({
      language,
    })
    const allSubSubjects: SubjectItem[] = queryForSubSubjects({
      language,
    })

    const statisticsResponse: QueryResponse<Statistics, XData> = getStatisticsContentByRegStatId(
      statistics.map((stat) => String(stat.id)),
      language
    )
    const statisticsRecord: Record<string, Content<Statistics, XData>> = contentArrayToRecord(
      statisticsResponse.hits,
      (c) => c.data.statistic!
    )
    const aboutTheStatisticsKeys: Array<string> = statisticsResponse.hits
      .map((stat) => stat.data.aboutTheStatistics)
      .filter(notNullOrUndefined)
    const aboutTheStatistics: Record<string, Content<OmStatistikken, XData>> = getByIds<OmStatistikken>(
      aboutTheStatisticsKeys,
      language
    )

    statistics.forEach((statistic) => {
      const statisticsContent: Content<Statistics, XData> | undefined = statisticsRecord[String(statistic.id)]
      const aboutTheStatisticsContent: Content<OmStatistikken, XData> | undefined = statisticsContent?.data
        .aboutTheStatistics
        ? aboutTheStatistics[statisticsContent?.data.aboutTheStatistics]
        : undefined

      const allMainSubjectsStatistic: SubjectItem[] = getAllMainSubjectByContent(
        statisticsContent,
        allMainSubjects,
        allSubSubjects
      )
      const allSubSubjectsStatistic: SubjectItem[] = getAllSubSubjectByContent(statisticsContent, allSubSubjects)
      const variants: VariantInListing[] = statistic.variants ? forceArray(statistic.variants) : []
      const releases: StatisticRelease[] = createContentStatisticReleases(variants, language)

      const releasesSorted: StatisticRelease[] = releases.sort((a, b) => {
        return new Date(a.publishTime || '01.01.3000').getTime() - new Date(b.publishTime || '01.01.3000').getTime()
      })

      const path = `/${statistic.shortName}-${language}`
      const exists: Array<string> = connection.exists(path)

      const content: ContentLight<Statistic> = createContentStatistic({
        statistic,
        language,
        statisticsContent,
        aboutTheStatisticsContent,
        allMainSubjectsStatistic,
        allSubSubjectsStatistic,
        releases: releasesSorted,
      })

      if (!exists) {
        connection.create<ContentLight<Statistic>>(content)
      } else {
        connection.modify<ContentLight<Statistic>>({
          key: path,
          editor: (node) => {
            return {
              ...node,
              displayName: content.displayName,
              modifiedTime: content.modifiedTime,
              language: content.language,
              publish: content.publish,
              data: {
                ...content.data,
              },
            }
          },
        })
      }
    })
  })
}

function getStatisticsContentByRegStatId(statisticsIds: string[], language: string): QueryResponse<Statistics, XData> {
  return query<Statistics, XData>({
    count: statisticsIds.length,
    contentTypes: [`${app.name}:statistics`],
    filters: {
      boolean: {
        must: [
          {
            hasValue: {
              field: 'language',
              values: language === 'en' ? ['en'] : ['nb', 'nn'],
            },
          },
          {
            hasValue: {
              field: 'data.statistic',
              values: statisticsIds,
            },
          },
        ],
      },
    },
  })
}

function createContentStatistic(params: CreateContentStatisticParams): ContentLight<Statistic> & NodeCreateParams {
  const { statistic, language } = params

  return {
    displayName: language === 'nb' ? statistic.name : statistic.nameEN,
    _name: `${statistic.shortName}-${language}`,
    _inheritsPermissions: true,
    modifiedTime: asLocalDateTime(statistic.modifiedTime),
    data: prepareData(params),
    language,
    publish: {
      from: '',
    },
  }
}

function createContentStatisticReleases(variants: VariantInListing[], language: string): StatisticRelease[] {
  const releases: StatisticRelease[] = []
  variants.forEach((variant) => {
    releases.push({
      frequency: variant.frekvens,
      publishTime: variant.previousRelease,
      period:
        variant.previousFrom !== ''
          ? capitalize(calculatePeriod(variant.frekvens, variant.previousFrom, variant.previousTo, language))
          : '',
    })
    forceArray(variant.upcomingReleases).forEach((release) => {
      releases.push({
        frequency: variant.frekvens,
        publishTime: release.publishTime,
        period:
          release.periodFrom !== ''
            ? capitalize(calculatePeriod(variant.frekvens, release.periodFrom, release.periodTo, language))
            : '',
      })
    })
  })
  return releases
}

function asLocalDateTime(str: string): LocalDateTime
function asLocalDateTime(str: string | undefined): LocalDateTime | undefined
function asLocalDateTime(str: string | undefined): LocalDateTime | undefined {
  return notEmptyOrUndefined(str) ? localDateTime(str.replace(' ', 'T')) : undefined
}

function prepareData({
  statistic,
  language,
  statisticsContent,
  aboutTheStatisticsContent,
  allMainSubjectsStatistic,
  allSubSubjectsStatistic,
  releases,
}: CreateContentStatisticParams): Statistic {
  return {
    statisticId: String(statistic.id),
    shortName: statistic.shortName,
    name: language === 'nb' ? statistic.name : statistic.nameEN,
    ingress:
      aboutTheStatisticsContent?.data.ingress ??
      statisticsContent?.x?.['com-enonic-app-metafields']?.['meta-data'].seoDescription,
    status: statistic.status,
    previousRelease: '',
    previousPeriod: '',
    statisticContentId: statisticsContent?._id,
    articleType: 'statistics',
    mainSubjects: allMainSubjectsStatistic.map((subject) => subject.name).filter(notNullOrUndefined),
    subSubjects: allSubSubjectsStatistic.map((subject) => subject.name).filter(notNullOrUndefined),
    releases: releases,
  }
}

function getByIds<Data extends object>(
  ids: Array<string>,
  language: 'en' | 'nb'
): Record<string, Content<Data, XData>> {
  return contentArrayToRecord(
    query<Data, XData>({
      count: ids.length,
      filters: {
        ids: {
          values: ids,
        },
        hasValue: {
          field: 'language',
          values: language === 'en' ? ['en'] : ['nb', 'nn'],
        },
      },
    }).hits
  )
}

export interface Statistic {
  statisticId: string
  shortName: string
  name: string
  ingress?: string
  status: string
  previousRelease?: string
  previousPeriod: string
  statisticContentId?: string
  articleType: 'statistics'
  mainSubjects: Array<string> | string | undefined
  subSubjects: Array<string> | string | undefined
  releases: Array<StatisticRelease>
}

export interface StatisticRelease {
  frequency: string
  publishTime: string
  period: string
}

export interface ContentLight<Data> {
  displayName?: string
  modifiedTime?: LocalDateTime | string
  data: Data
  language: 'nb' | 'en'
  publish?: {
    from?: Instant | string
  }
}

interface CreateContentStatisticParams {
  statistic: StatisticInListing
  language: 'nb' | 'en'
  statisticsContent?: Content<Statistics, XData>
  aboutTheStatisticsContent?: Content<OmStatistikken, XData>
  allMainSubjectsStatistic: SubjectItem[]
  allSubSubjectsStatistic: SubjectItem[]
  releases: StatisticRelease[]
}
