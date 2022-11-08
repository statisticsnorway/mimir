import { get as getRepo, create as createRepo } from '/lib/xp/repo'
import { connect, type RepoConnection, type NodeCreateParams } from '/lib/xp/node'
import { localDateTime, type LocalDateTime } from '/lib/xp/value'
import { run } from '/lib/xp/context'
import { getAllStatisticsFromRepo } from '/lib/ssb/statreg/statistics'
import { contentArrayToRecord, forceArray } from '/lib/ssb/utils/arrayUtils'
import { notEmptyOrUndefined, notNullOrUndefined } from '/lib/ssb/utils/coreUtils'
import type { StatisticInListing, VariantInListing } from '/lib/ssb/dashboard/statreg/types'
import { query, type Content, type QueryResponse } from '/lib/xp/content'
import { OmStatistikken } from '../../../site/content-types/omStatistikken/omStatistikken'
import { XData } from '../../../site/x-data'
import { Statistics } from '../../../site/content-types/statistics/statistics'
import { capitalize } from '/lib/ssb/utils/stringUtils'
import { calculatePeriod } from '/lib/ssb/utils/variantUtils'
import { SubjectItem } from '/lib/ssb/utils/subjectUtils'
import { ReleasesInListing } from '/lib/ssb/dashboard/statreg/types'

const {
  queryForMainSubjects, queryForSubSubjects, getSecondaryMainSubject
} = __non_webpack_require__( '/lib/ssb/utils/subjectUtils')

export const REPO_ID_STATREG_STATISTICS: 'no.ssb.statreg.statistics.variants' = 'no.ssb.statreg.statistics.variants' as const

const LANGUAGES: ReadonlyArray<'en' | 'nb'> = ['nb', 'en'] as const

export function createOrUpdateStatisticsRepo(): void {
  log.info(`Initiating "${REPO_ID_STATREG_STATISTICS}"`)
  run({
    user: {
      login: 'su',
      idProvider: 'system'
    },
    branch: 'master'
  }, () => {
    fillRepo(getAllStatisticsFromRepo())
    log.info(`Finished initiating "${REPO_ID_STATREG_STATISTICS}"`)
  })
}

export function fillRepo(statistics: Array<StatisticInListing>) {
  if (getRepo(REPO_ID_STATREG_STATISTICS) === null) {
    createRepo({
      id: REPO_ID_STATREG_STATISTICS,
      rootPermissions: [
        {
          principal: 'role:system.admin',
          allow: ['READ', 'CREATE', 'MODIFY', 'DELETE', 'PUBLISH', 'READ_PERMISSIONS', 'WRITE_PERMISSIONS'],
          deny: []
        },
        {
          principal: 'role:system.everyone',
          allow: ['READ'],
          deny: []
        }
      ]
    })
  }

  const connection: RepoConnection = connect({
    repoId: REPO_ID_STATREG_STATISTICS,
    branch: 'master'
  })

  LANGUAGES.forEach((language) => {
    const allMainSubjects: SubjectItem[] = queryForMainSubjects({
      language
    })
    const allSubSubjects: SubjectItem[] = queryForSubSubjects({
      language
    })

    const statisticsResponse: QueryResponse<Statistics, XData> = getStatisticsContentByRegStatId(statistics.map((stat) => String(stat.id)), language)
    const statisticsRecord: Record<string, Content<Statistics, XData>> = contentArrayToRecord(statisticsResponse.hits, (c) => c.data.statistic!)
    const aboutTheStatisticsKeys: Array<string> = statisticsResponse.hits.map((stat) => stat.data.aboutTheStatistics).filter(notNullOrUndefined)
    const aboutTheStatistics: Record<string, Content<OmStatistikken, XData>> = getByIds<OmStatistikken>(aboutTheStatisticsKeys, language)

    statistics.forEach((statistic) => {
      const statisticsContent: Content<Statistics, XData> | undefined = statisticsRecord[String(statistic.id)]
      const aboutTheStatisticsContent: Content<OmStatistikken, XData> | undefined = statisticsContent?.data.aboutTheStatistics ?
        aboutTheStatistics[statisticsContent?.data.aboutTheStatistics] :
        undefined

      const mainSubject: SubjectItem[] = allMainSubjects.filter((subject) => statisticsContent?._path.startsWith(subject.path))
      const subTopics:Array<string> = statisticsContent?.data.subtopic ? forceArray(statisticsContent.data.subtopic) : []
      const secondaryMainSubject: SubjectItem[] = subTopics ? getSecondaryMainSubject(subTopics, allMainSubjects, allSubSubjects) : []
      const allMainSubjectsStatistic: SubjectItem[] = mainSubject.concat(secondaryMainSubject)

      forceArray(statistic.variants).forEach((variant) => {
        const path: string = `/${statistic.shortName}-${variant.id}–${language}`
        const exists: Array<string> = connection.exists(path)
        const content: ContentLight<Release> = createContentStatisticVariant({
          statistic,
          variant,
          language,
          statisticsContent,
          aboutTheStatisticsContent,
          allMainSubjectsStatistic
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
                  ...content.data
                }
              }
            }
          })
        }
      })
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
              values: language === 'en' ? ['en'] : ['nb', 'nn']
            }
          },
          {
            hasValue: {
              field: 'data.statistic',
              values: statisticsIds
            }
          }
        ]
      }

    }
  })
}


function createContentStatisticVariant(params: CreateContentStatisticVariantParams): ContentLight<Release> & NodeCreateParams {
  const {
    statistic, variant, language
  } = params

  return {
    displayName: language === 'nb' ? statistic.name : statistic.nameEN,
    _name: `${statistic.shortName}-${variant.id}–${language}`,
    _inheritsPermissions: true,
    modifiedTime: asLocalDateTime(variant.previousRelease),
    data: prepareData(params),
    language,
    publish: {
      from: asLocalDateTime(variant.previousRelease)
    }
  }
}

function asLocalDateTime(str: string): LocalDateTime;
function asLocalDateTime(str: string | undefined): LocalDateTime | undefined;
function asLocalDateTime(str: string | undefined): LocalDateTime | undefined {
  return notEmptyOrUndefined(str) ? localDateTime(str.replace(' ', 'T')) : undefined
}

function prepareData({
  statistic, variant, language, statisticsContent, aboutTheStatisticsContent, allMainSubjectsStatistic
}: CreateContentStatisticVariantParams): Release {
  return {
    statisticId: String(statistic.id),
    variantId: String(variant.id),
    shortName: statistic.shortName,
    name: language === 'nb' ? statistic.name : statistic.nameEN,
    period: capitalize(calculatePeriod(variant.frekvens, variant.previousFrom, variant.previousTo, language)),
    ingress: aboutTheStatisticsContent?.data.ingress ?? statisticsContent?.x?.['com-enonic-app-metafields']?.['meta-data'].seoDescription,
    status: statistic.status,
    frequency: variant.frekvens,
    previousRelease: variant.previousRelease,
    previousFrom: variant.previousFrom,
    previousTo: variant.previousTo,
    nextRelease: variant.nextRelease,
    statisticContentId: statisticsContent?._id,
    articleType: 'statistics', // allows this content to be filtered together with `Article.articleType`,
    mainSubjects: allMainSubjectsStatistic
      .map((subject) => subject.name)
      .filter(notNullOrUndefined),
    upcomingReleases: variant.upcomingReleases
  }
}


function getByIds<Data extends object>(ids: Array<string>, language: 'en' | 'nb'): Record<string, Content<Data, XData>> {
  return contentArrayToRecord(
    query<Data, XData>({
      count: ids.length,
      filters: {
        ids: {
          values: ids
        },
        hasValue: {
          field: 'language',
          values: language === 'en' ? ['en'] : ['nb', 'nn']
        }
      }
    }).hits
  )
}

export interface Release {
  statisticId: string;
  variantId: string;
  shortName: string;
  name: string;
  period: string;
  ingress?: string;
  status: string;
  frequency: string;
  previousRelease?: string;
  previousFrom?: string;
  previousTo?: string;
  nextRelease?: string;
  statisticContentId?: string;
  articleType: 'statistics';
  mainSubjects: Array<string> | string | undefined;
  upcomingReleases?: Array<ReleasesInListing>;
}


export interface ContentLight<Data> {
  displayName?: string;
  modifiedTime?: LocalDateTime | string;
  data: Data;
  language: 'nb' | 'en';
  publish?: {
    from?: LocalDateTime | string;
  }
}

interface CreateContentStatisticVariantParams {
  statistic: StatisticInListing;
  variant: VariantInListing;
  language: 'nb' | 'en';
  statisticsContent?: Content<Statistics, XData>;
  aboutTheStatisticsContent?: Content<OmStatistikken, XData>;
  allMainSubjectsStatistic: SubjectItem[]
}
