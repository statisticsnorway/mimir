import { CacheLib, Cache } from '../types/cache'
import { Request, Response } from 'enonic-types/lib/controller'
import { EventLibrary, EnonicEvent, EnonicEventData } from 'enonic-types/lib/event'
import { ContextLibrary } from 'enonic-types/lib/context'
import { ContentLibrary, QueryResponse, Content } from 'enonic-types/lib/content'
import { Dataset as JSDataset } from '../types/jsonstat-toolkit'
import { TbmlData } from '../types/xmlParser'
import { Dataquery } from '../../site/content-types/dataquery/dataquery'
import { Dataset } from '../../site/content-types/dataset/dataset'

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
  query,
  get
}: ContentLibrary = __non_webpack_require__('/lib/xp/content')

const masterFilterCaches: Map<string, Cache> = new Map()
const draftFilterCaches: Map<string, Cache> = new Map()
const masterMenuCache: Cache = newCache({
  expire: 3600,
  size: 2
})
const draftMenuCache: Cache = newCache({
  expire: 3600,
  size: 2
})
const masterDatasetCache: Cache = newCache({
  expire: 3600,
  size: 300
})
const draftDatasetCache: Cache = newCache({
  expire: 3600,
  size: 300
})

export function setup(): void {
  log.info('initializing cache node listener')
  listener({
    type: 'node.*',
    localOnly: true,
    callback: onNodeChange
  })

  listener({
    type: 'custom.clearCache',
    callback: (e: EnonicEvent<CompletelyClearCacheOptions>) => completelyClearCache(e.data)
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
        const content: Content | null = get({
          key: n.id
        })
        if (content) {
          clearCache(content, n.branch, n.branch === 'master' ? masterCleared : draftCleared)
        } else {
          // the element is deleted, so lets try to clear it only based on id, and its parent
          clearCache({
            _id: n.id
          } as Content, n.branch, n.branch === 'master' ? masterCleared : draftCleared)
          // the path on these nodes are not site, but repo relative, so we need to strip out the /content at the start
          const parentPath: string = n.path.substring('/content'.length, n.path.lastIndexOf('/'))
          const parent: Content | null = get({
            key: parentPath
          })
          if (parent) {
            clearCache(parent, n.branch, n.branch === 'master' ? masterCleared : draftCleared)
          }
        }
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

function clearCache(content: Content, branch: string, cleared: Array<string>): Array<string> {
  if (cleared.filter((c) => content._id === c).length > 0) { // already cleared
    log.info(`already cleared ${content._id}(${branch})`)
    return cleared
  }
  cleared.push(content._id)

  // try to clear filter cache
  const cacheMap: Map<string, Cache> = branch === 'master' ? masterFilterCaches : draftFilterCaches
  const filterCache: Cache | undefined = cacheMap.get(content._id)
  if (filterCache) {
    log.info(`clear ${content._id} filter cache(${branch})`)
    filterCache.clear()
  }

  // clear menu cache
  if (content.type === `${app.name}:menuItem`) {
    completelyClearMenuCache(branch)
  }

  // clear dataset cache based on dataquery id
  if (content.type === `${app.name}:dataquery`) {
    log.info(`clear ${content._id} from dataset cache (${branch})`)
    const datasetCache: Cache = branch === 'master' ? masterDatasetCache : draftDatasetCache
    datasetCache.remove(content._id)
  }

  // find dataquery based on dataset
  const references: Array<Content> = getReferences(content._id)
  if (content.type === `${app.name}:dataset`) {
    const dataset: Content<Dataset> = content as Content<Dataset>
    if (dataset.data.dataquery) {
      const dataquery: Content | null = get({
        key: dataset.data.dataquery
      })
      if (dataquery) {
        references.push(dataquery)
      }
    }
  }
  references.forEach((ref) => {
    log.info(`try to clear reference ${ref._id} to ${content._id}(${branch})`)
    clearCache(ref, branch, cleared)
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

export function fromMenuCache(req: Request, key: string, fallback: () => unknown): unknown {
  if (req.mode === 'live' || req.mode === 'preview') {
    const branch: string = req.mode === 'live' ? 'master' : 'draft'
    const menuCache: Cache = branch === 'master' ? masterMenuCache : draftMenuCache
    return menuCache.get(key, () => {
      log.info(`added ${key} to menu cache (${branch})`)
      return fallback()
    })
  }
  return fallback()
}

export function fromDatasetCache(req: Request, key: string, fallback: () => DatasetCache): DatasetCache {
  if (req.mode === 'live' || req.mode === 'preview') {
    const branch: string = req.mode === 'live' ? 'master' : 'draft'
    const datasetCache: Cache = branch === 'master' ? masterDatasetCache : draftDatasetCache
    return datasetCache.get(key, () => {
      log.info(`added ${key} to dataset cache (${branch})`)
      return fallback()
    })
  }
  return fallback()
}

function completelyClearFilterCache(branch: string): void {
  const cacheMap: Map<string, Cache> = branch === 'master' ? masterFilterCaches : draftFilterCaches
  cacheMap.forEach((cache: Cache, filterKey: string) => {
    log.info(`clear ${filterKey} filter cache(${branch})`)
    cache.clear()
    cacheMap.delete(filterKey)
  })
}

function completelyClearMenuCache(branch: string): void {
  log.info(`clear header/footer cache (${branch})`)
  const menuCache: Cache = branch === 'master' ? masterMenuCache : draftMenuCache
  menuCache.clear()
}

function completelyClearDatasetCache(branch: string): void {
  log.info(`clear dataset cache (${branch})`)
  const datasetCache: Cache = branch === 'master' ? masterDatasetCache : draftDatasetCache
  datasetCache.clear()
}

function completelyClearCache(options: CompletelyClearCacheOptions): void {
  if (options.clearFilterCache) {
    completelyClearFilterCache('master')
    completelyClearFilterCache('draft')
  }

  if (options.clearMenuCache) {
    completelyClearMenuCache('master')
    completelyClearMenuCache('draft')
  }

  if (options.clearDatasetCache) {
    completelyClearDatasetCache('master')
    completelyClearDatasetCache('draft')
  }
}

export interface DatasetCache {
  data: JSDataset | Array<JSDataset> | null | TbmlData | TbmlData;
  format: Dataquery['datasetFormat'];
}

export interface CompletelyClearCacheOptions {
  clearFilterCache: boolean;
  clearMenuCache: boolean;
  clearDatasetCache: boolean;
}

export interface SSBCacheLibrary {
  setup: () => void;
  fromFilterCache: (req: Request, filterKey: string, key: string, fallback: () => Response) => Response;
  fromMenuCache: (req: Request, key: string, fallback: () => unknown) => unknown;
  fromDatasetCache: (req: Request, key: string, fallback: () => DatasetCache) => DatasetCache;
}
