import { Content, QueryResponse } from '/lib/xp/content'
import { DefaultPageConfig } from '../../../site/pages/default/default-page-config'
import { Statistics } from '../../../site/content-types/statistics/statistics'
import { StatisticInListing } from '../dashboard/statreg/types'
import { Page } from '../../../site/content-types/page/page'

const {
  getStatisticByShortNameFromRepo
} = __non_webpack_require__('/lib/ssb/statreg/statistics')
const {
  get: getContent,
  query
} = __non_webpack_require__('/lib/xp/content')
const {
  fromParentTypeCache
} = __non_webpack_require__('/lib/ssb/cache/cache')

export function getParentType(path: string): string | undefined {
  return fromParentTypeCache(path, () => parentType(path))
}

export function getParentContent(path: string): Content<object, DefaultPageConfig | Statistics> | null {
  const parentPathKey: string = parentPath(path)
  return getContent({
    key: parentPathKey
  }) as Content<object, DefaultPageConfig | Statistics> | null
}

function parentType(path: string): string | undefined {
  const parentPathKey: string = parentPath(path)

  const parentContent: Content<object, DefaultPageConfig> | null = getContent({
    key: parentPathKey
  }) as Content<object, DefaultPageConfig> | null

  if (parentContent) {
    if (parentContent.type === `${app.name}:statistics`) {
      return parentContent.type
    } else if (parentContent.page.config || parentContent.type === 'portal:site') {
      return parentContent.page.config.pageType ? parentContent.page.config.pageType : 'default'
    } else {
      return fromParentTypeCache(parentPathKey, () => parentType(parentPathKey))
    }
  } else {
    log.error(`Cound not find content from path ${path}`)
    return undefined
  }
}


export function parentPath(path: string): string {
  const pathElements: Array<string> = path.split('/')
  pathElements.pop()
  return pathElements.join('/')
}

export function getMainSubject(shortName: string, language: string): string {
  const statisticFromRepo: StatisticInListing | undefined = getStatisticByShortNameFromRepo(shortName)
  if (statisticFromRepo) {
    const statisticResult: QueryResponse<Statistics> = statisticFromRepo && query({
      query: `data.statistic = '${statisticFromRepo.id}' AND language IN (${language === 'nb' ? '"nb", "nn"' : '"en"'})`,
      contentTypes: [`${app.name}:statistics`],
      count: 1
    })
    const statisticContent: Content<Statistics> | undefined = statisticResult.total === 1 ? statisticResult.hits[0] : undefined

    const parentPath: string | undefined = statisticContent && statisticContent._path.split('/').splice(1, 3).join('/')

    const parentContent: Content<Page> | null = parentPath ? getContent({
      key: `/${parentPath}`
    }) : null
    return parentContent ? parentContent.displayName : ''
  }
  return ''
}

export function getMainSubjectStatistic(statistic: Content<Statistics>): string {
  const parentPath: string | undefined = statistic && statistic._path.split('/').splice(1, 3).join('/')
  const parentContent: Content<Page> | null = parentPath ? getContent({
    key: `/${parentPath}`
  }) : null
  return parentContent ? parentContent.displayName : ''
}

export interface ParentUtilsLib {
  getParentType: (path: string) => string | undefined;
  getParentContent: (path: string) => Content<object, DefaultPageConfig | Statistics> | null;
  parentType: (path: string) => string | undefined;
  parentPath: (path: string) => string;
  getMainSubject: (shortName: string, language: string) => string;
  getMainSubjectStatistic: (statistic: Content<Statistics>) => string;
}
