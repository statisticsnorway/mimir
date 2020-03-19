import { CacheLib, Cache } from '../types/cache'
import { Request, Response } from 'enonic-types/lib/controller'
import { EventLibrary, EnonicEvent, EnonicEventData } from 'enonic-types/lib/event'
import { ContextLibrary } from 'enonic-types/lib/context'
import { ContentLibrary, QueryResponse, Content } from 'enonic-types/lib/content'

const {
  newCache
}: CacheLib = __non_webpack_require__( '/lib/cache')
const {
  listener
}: EventLibrary = __non_webpack_require__('/lib/xp/event')
const {
  run
}: ContextLibrary = __non_webpack_require__('/lib/xp/context')
const {
  query
}: ContentLibrary = __non_webpack_require__('/lib/xp/content')

const masterFilterCaches: Map<string, Cache> = new Map()
const draftFilterCaches: Map<string, Cache> = new Map()

export function setup(): void {
  log.info('initializing cache node listener')
  listener({
    type: 'node.*',
    localOnly: true,
    callback: onNodeChange
  })
}

function onNodeChange(event: EnonicEvent<EnonicEventData>): void {
  const validNodes: EnonicEventData['nodes'] = event.data.nodes.filter((n) => n.repo === 'com.enonic.cms.default')
  if (validNodes.length > 0) {
    const draftCleared: Array<string> = []
    const masterCleared: Array<string> = []
    validNodes.forEach((n) => {
      // need to run in correct context for getReferences to work
      run({
        repository: n.repo,
        branch: n.branch,
        user: {
          login: 'su',
          idProvider: 'system'
        },
        principals: ['role:system.admin']
      },
      () => {
        // clear id and all references to id from cache
        log.info(`try to clear ${n.id}(${n.branch})`)
        clearFilterCache(n.id, n.branch, n.branch === 'master' ? masterCleared : draftCleared)
      })
    })
  }
}

function getReferences(id: string): Array<Content> {
  let start: number = 0
  let count: number = 10
  let hits: Array<Content> = []
  while (count === 10) {
    const result: QueryResponse<Content> = query({
      start,
      count,
      query: `_references LIKE "${id}"`
    })
    count = result.count
    start += count
    hits = hits.concat(result.hits)
  }
  return hits
}

function clearFilterCache(id: string, branch: string, cleared: Array<string>): Array<string> {
  if (cleared.filter((c) => id === c).length > 0) { // already cleared
    log.info(`already cleared ${id}(${branch})`)
    return cleared
  }
  cleared.push(id)
  const cacheMap: Map<string, Cache> = branch === 'master' ? masterFilterCaches : draftFilterCaches
  const filterCache: Cache | undefined = cacheMap.get(id)
  if (filterCache) {
    log.info(`clear ${id} filter cache(${branch})`)
    filterCache.clear()
  }

  const references: Array<Content> = getReferences(id)
  references.forEach((ref) => {
    log.info(`try to clear reference ${ref._id} to ${id}(${branch})`)
    clearFilterCache(ref._id, branch, cleared)
  })

  return cleared
}

function getFilterCache(branch: string, filterKey: string): Cache {
  const cacheMap: Map<string, Cache> = branch === 'master' ? masterFilterCaches : draftFilterCaches
  let filterCache: Cache | undefined = cacheMap.get(filterKey)
  if (!filterCache) {
    filterCache = newCache({
      size: 1000,
      expire: 3600
    })
    cacheMap.set(filterKey, filterCache)
  }
  return filterCache
}

export function fromFilterCache(req: Request, filterKey: string, key: string, fallback: () => Response): Response {
  if (req.mode === 'live' || req.mode === 'preview') {
    const branch: string = req.mode === 'live' ? 'master' : 'draft'
    const filterCache: Cache = getFilterCache(branch, filterKey)
    return filterCache.get(key, () => {
      log.info(`added ${key} to ${filterKey} filter cache (${branch})`)
      return fallback()
    })
  }
  return fallback()
}
