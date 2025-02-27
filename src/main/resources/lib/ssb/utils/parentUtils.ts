import { get as getContent, query, Content, ContentsResult } from '/lib/xp/content'
import { StatisticInListing } from '/lib/ssb/dashboard/statreg/types'
import { type DefaultPage } from '/lib/types/defaultPage'

import { getStatisticByShortNameFromRepo } from '/lib/ssb/statreg/statistics'
import { fromParentTypeCache } from '/lib/ssb/cache/cache'
import { type Statistics, type Page } from '/site/content-types'
import { type Default as DefaultPageConfig } from '/site/pages/default'

export function getParentType(path: string): string | undefined {
  return fromParentTypeCache(path, () => parentType(path))
}

export function getParentContent(path: string): Content<DefaultPageConfig | Statistics> | null {
  const parentPathKey: string = parentPath(path)
  return getContent({
    key: parentPathKey,
  })
}

function parentType(path: string): string | undefined {
  const parentPathKey: string = parentPath(path)

  const parentContent: DefaultPage | null = getContent({
    key: parentPathKey,
  }) as unknown as DefaultPage

  if (parentContent) {
    if (parentContent.type === `${app.name}:statistics`) {
      return parentContent.type
    } else if (
      (parentContent.page.config && typeof parentContent.page.config === 'function') ||
      parentContent.type === 'portal:site'
    ) {
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
    const statisticResult: ContentsResult<Content<Statistics>> =
      statisticFromRepo &&
      query({
        query: `data.statistic = '${statisticFromRepo.id}' AND language IN (${
          language === 'nb' ? '"nb", "nn"' : '"en"'
        })`,
        contentTypes: [`${app.name}:statistics`],
        count: 1,
      })
    const statisticContent: Content<Statistics> | undefined =
      statisticResult.total === 1 ? statisticResult.hits[0] : undefined

    const parentPath: string | undefined = statisticContent && statisticContent._path.split('/').splice(1, 3).join('/')

    const parentContent: Content<Page> | null = parentPath
      ? getContent({
          key: `/${parentPath}`,
        })
      : null
    return parentContent ? parentContent.displayName : ''
  }
  return ''
}

export function getMainSubjectStatistic(statistic: Content<Statistics>): string {
  const parentPath: string | undefined = statistic && statistic._path.split('/').splice(1, 3).join('/')
  const parentContent: Content<Page> | null = parentPath
    ? getContent({
        key: `/${parentPath}`,
      })
    : null
  return parentContent ? parentContent.displayName : ''
}
