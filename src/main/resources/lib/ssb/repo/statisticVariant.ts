import { create as createRepo, get as getRepo } from '/lib/xp/repo'
import { connect, CreateNodeParams, type RepoConnection } from '/lib/xp/node'
import { type Instant, instant, type LocalDateTime, localDateTime } from '/lib/xp/value'
import { run } from '/lib/xp/context'
import { getAllStatisticsFromRepo } from '/lib/ssb/statreg/statistics'
import { contentArrayToRecord, forceArray } from '/lib/ssb/utils/arrayUtils'
import { notEmptyOrUndefined, notNullOrUndefined } from '/lib/ssb/utils/coreUtils'
import type { ReleasesInListing, StatisticInListing, VariantInListing } from '/lib/ssb/dashboard/statreg/types'
import type { QueryDsl } from '/lib/xp/content'
import { type Content, query } from '/lib/xp/content'
import type { OmStatistikken, Statistics } from '/site/content-types'
import { capitalize } from '/lib/ssb/utils/stringUtils'
import { calculatePeriod, getNextRelease, getPreviousRelease, nextReleasedPassed } from '/lib/ssb/utils/variantUtils'
import type { SubjectItem } from '/lib/ssb/utils/subjectUtils'

const { queryForSubjects, getAllMainSubjectByContent, getAllSubSubjectByContent } =
  __non_webpack_require__('/lib/ssb/utils/subjectUtils')

export const REPO_ID_STATREG_STATISTICS: 'no.ssb.statreg.statistics.variants' =
  'no.ssb.statreg.statistics.variants' as const

const LANGUAGES: ReadonlyArray<'en' | 'nb'> = ['nb', 'en'] as const

export function createOrUpdateStatisticsRepo(): void {
  log.info(`Initiating "${REPO_ID_STATREG_STATISTICS}"`)
  run(
    {
      user: {
        login: 'su',
        idProvider: 'system',
      },
      branch: 'master',
    },
    () => {
      fillRepo(getAllStatisticsFromRepo())
      log.info(`Finished initiating "${REPO_ID_STATREG_STATISTICS}"`)
    }
  )
}

export function getRepoConnectionStatistics(): RepoConnection {
  return connect({
    repoId: 'no.ssb.statreg.statistics.variants',
    branch: 'master',
  })
}

export function getStatisticVariantsFromRepo(
  language: string,
  query?: QueryDsl,
  count?: number
): ContentLight<Release>[] {
  const connectionStatisticRepo: RepoConnection = getRepoConnectionStatistics()
  const res = connectionStatisticRepo.query({
    count: count ? count : 1000,
    sort: 'publish.from DESC',
    query: query || undefined,
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

  return res.hits.map((hit) => connectionStatisticRepo.get(hit.id) as ContentLight<Release>)
}

export function getUpcompingStatisticVariantsFromRepo(count?: number): ContentLight<Release>[] {
  const connectionStatisticRepo: RepoConnection = getRepoConnectionStatistics()
  const res = connectionStatisticRepo.query({
    count: count ? count : 1000,
    sort: 'publish.from DESC',
    query: {
      range: {
        field: 'data.nextRelease',
        gte: new Date().toISOString(),
      },
    },
  })

  return res.hits.map((hit) => connectionStatisticRepo.get(hit.id) as ContentLight<Release>)
}

export function fillRepo(statistics: Array<StatisticInListing>) {
  if (getRepo(REPO_ID_STATREG_STATISTICS) === null) {
    createRepo({
      id: REPO_ID_STATREG_STATISTICS,
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
    repoId: REPO_ID_STATREG_STATISTICS,
    branch: 'master',
  })

  LANGUAGES.forEach((language) => {
    const allMainSubjects: SubjectItem[] = queryForSubjects({
      language,
      subjectType: 'mainSubject',
    })
    const allSubSubjects: SubjectItem[] = queryForSubjects({
      language,
      subjectType: 'subSubject',
    })

    const statisticsResponse = getStatisticsContentByRegStatId(
      statistics.map((stat) => String(stat.id)),
      language
    )
    const statisticsRecord: Record<string, Content<Statistics>> = contentArrayToRecord(
      statisticsResponse.hits,
      (c) => c.data.statistic!
    )
    const aboutTheStatisticsKeys: Array<string> = statisticsResponse.hits
      .map((stat) => stat.data.aboutTheStatistics)
      .filter(notNullOrUndefined)
    const aboutTheStatistics: Record<string, Content<OmStatistikken>> = getByIds<OmStatistikken>(
      aboutTheStatisticsKeys,
      language
    )

    statistics.forEach((statistic) => {
      const statisticsContent: Content<Statistics> | undefined = statisticsRecord[String(statistic.id)]
      const aboutTheStatisticsContent: Content<OmStatistikken> | undefined = statisticsContent?.data.aboutTheStatistics
        ? aboutTheStatistics[statisticsContent?.data.aboutTheStatistics]
        : undefined

      const allMainSubjectsStatistic: SubjectItem[] = getAllMainSubjectByContent(
        statisticsContent,
        allMainSubjects,
        allSubSubjects
      )
      const allSubSubjectsStatistic: SubjectItem[] = getAllSubSubjectByContent(statisticsContent, allSubSubjects)

      forceArray(statistic.variants).forEach((variant) => {
        const path = `/${statistic.shortName}-${variant.id}-${language}`
        const exists = connection.exists(path)
        const nextReleasePassed: boolean = nextReleasedPassed(variant)
        const prevRelease: ReleasesInListing = getPreviousRelease(nextReleasePassed, variant)
        const nextRelease: ReleasesInListing | undefined = getNextRelease(nextReleasePassed, variant)
        const content: ContentLight<Release> = createContentStatisticVariant({
          statistic,
          variant,
          prevRelease,
          nextRelease,
          language,
          statisticsContent,
          aboutTheStatisticsContent,
          allMainSubjectsStatistic,
          allSubSubjectsStatistic,
        })

        // Check if exists, and then do update instead if changed
        if (!exists) {
          connection.create<ContentLight<Release>>(content)
        } else {
          connection.modify<ContentLight<Release>>({
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
  })
}

function getStatisticsContentByRegStatId(statisticsIds: string[], language: string) {
  return query<Content<Statistics>>({
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

function createContentStatisticVariant(
  params: CreateContentStatisticVariantParams
): ContentLight<Release> & CreateNodeParams {
  const { statistic, variant, prevRelease, language } = params
  const serverOffsetInMs: number =
    app.config && app.config['serverOffsetInMs'] ? parseInt(app.config['serverOffsetInMs']) : 0
  const prevReleaseServerOffset: Date = new Date(new Date(prevRelease.publishTime).getTime() - serverOffsetInMs)

  return {
    displayName: language === 'nb' ? statistic.name : statistic.nameEN,
    _name: `${statistic.shortName}-${variant.id}-${language}`,
    _inheritsPermissions: true,
    modifiedTime: asLocalDateTime(variant.previousRelease),
    data: prepareData(params),
    language,
    publish: {
      from: prevRelease.publishTime ? instant(prevReleaseServerOffset) : '',
    },
  }
}

function asLocalDateTime(str: string): LocalDateTime
function asLocalDateTime(str: string | undefined): LocalDateTime | undefined
function asLocalDateTime(str: string | undefined): LocalDateTime | undefined {
  return notEmptyOrUndefined(str) ? localDateTime(str.replace(' ', 'T')) : undefined
}

function prepareData({
  statistic,
  variant,
  prevRelease,
  nextRelease,
  language,
  statisticsContent,
  aboutTheStatisticsContent,
  allMainSubjectsStatistic,
  allSubSubjectsStatistic,
}: CreateContentStatisticVariantParams): Release {
  const statisticPath: string = statisticsContent?._path ? statisticsContent._path.split('/').slice(2).join('/') : ''
  return {
    statisticId: String(statistic.id),
    variantId: String(variant.id),
    shortName: statistic.shortName,
    name: language === 'nb' ? statistic.name : statistic.nameEN,
    period: capitalize(calculatePeriod(variant.frekvens, prevRelease.periodFrom, prevRelease.periodTo, language)),
    ingress:
      aboutTheStatisticsContent?.data.ingress ??
      statisticsContent?.x?.['com-enonic-app-metafields']?.['meta-data'].seoDescription,
    status: statistic.status,
    frequency: variant.frekvens,
    previousRelease: prevRelease.publishTime ?? '',
    previousFrom: prevRelease.periodFrom,
    previousTo: prevRelease.periodTo,
    previousPeriod:
      prevRelease.periodFrom !== ''
        ? capitalize(calculatePeriod(variant.frekvens, prevRelease.periodFrom, prevRelease.periodTo, language))
        : '',
    nextRelease: nextRelease?.publishTime ?? '',
    nextPeriod: nextRelease
      ? capitalize(calculatePeriod(variant.frekvens, nextRelease.periodFrom, nextRelease.periodTo, language))
      : '',
    statisticContentId: statisticsContent?._id,
    statisticPath: encodeURI(statisticPath),
    articleType: 'statistics', // allows this content to be filtered together with `Article.articleType`,
    contacts: statisticsContent?.data.contacts ? forceArray(statisticsContent?.data.contacts) : [],
    mainSubjects: allMainSubjectsStatistic.map((subject) => subject.name).filter(notNullOrUndefined),
    subSubjects: allSubSubjectsStatistic.map((subject) => subject.name).filter(notNullOrUndefined),
    upcomingReleases: variant.upcomingReleases,
  }
}

function getByIds<Data extends object>(ids: Array<string>, language: 'en' | 'nb'): Record<string, Content<Data>> {
  return contentArrayToRecord(
    query<Content<Data>>({
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

export interface Release {
  statisticId: string
  variantId: string
  shortName: string
  name: string
  period: string
  ingress?: string
  status: string
  frequency: string
  previousRelease: string
  previousFrom?: string
  previousTo?: string
  previousPeriod: string
  nextRelease: string
  nextPeriod: string
  statisticContentId?: string
  statisticPath: string
  articleType: 'statistics'
  contacts: string[]
  mainSubjects: Array<string> | string | undefined
  subSubjects: Array<string> | string | undefined
  upcomingReleases?: Array<ReleasesInListing>
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

interface CreateContentStatisticVariantParams {
  statistic: StatisticInListing
  variant: VariantInListing
  prevRelease: ReleasesInListing
  nextRelease: ReleasesInListing | undefined
  language: 'nb' | 'en'
  statisticsContent?: Content<Statistics>
  aboutTheStatisticsContent?: Content<OmStatistikken>
  allMainSubjectsStatistic: SubjectItem[]
  allSubSubjectsStatistic: SubjectItem[]
}
