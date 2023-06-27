__non_webpack_require__('/lib/ssb/polyfills/nashorn')
import { listener, send, EnonicEvent, EnonicEventData } from '/lib/xp/event'
import { query, get, Content } from '/lib/xp/content'
import { run } from '/lib/xp/context'
import { JSONstat } from '/lib/types/jsonstat-toolkit'
import { TbmlDataUniform } from '/lib/types/xmlParser'
import { DATASET_REPO, DatasetRepoNode } from '/lib/ssb/repo/dataset'
import { Socket } from '/lib/types/socket'
import { MunicipalityWithCounty } from '/lib/ssb/dataset/klass/municipalities'
import { newCache, Cache } from '/lib/cache'
import type { DataSource } from '/site/mixins/dataSource'
import { request, HttpResponse } from '/lib/http-client'

const { executeFunction, sleep, submitTask } = __non_webpack_require__('/lib/xp/task')
const { getDataset, extractKey } = __non_webpack_require__('/lib/ssb/dataset/dataset')
const { cacheLog } = __non_webpack_require__('/lib/ssb/utils/serverLog')
const { completelyClearSubjectCache, clearSubjectCache } = __non_webpack_require__('/lib/ssb/cache/subjectCache')
const { completelyClearPartCache, clearPartCache } = __non_webpack_require__('/lib/ssb/cache/partCache')
const { ENONIC_CMS_DEFAULT_REPO } = __non_webpack_require__('/lib/ssb/repo/common')

const masterFilterCaches: Map<string, Cache> = new Map()
const draftFilterCaches: Map<string, Cache> = new Map()
const masterMenuCache: Cache = newCache({
  expire: 3600,
  size: 10,
})
const draftMenuCache: Cache = newCache({
  expire: 3600,
  size: 10,
})
const draftRelatedArticlesCache: Cache = newCache({
  expire: 3600,
  size: 200,
})
const masterRelatedArticlesCache: Cache = newCache({
  expire: 3600,
  size: 200,
})
const draftRelatedFactPageCache: Cache = newCache({
  expire: 3600,
  size: 200,
})
const masterRelatedFactPageCache: Cache = newCache({
  expire: 3600,
  size: 200,
})
const datasetRepoCache: Cache = newCache({
  expire: 3600,
  size: 1500,
})
const parsedMunicipalityCache: Cache = newCache({
  expire: 3600,
  size: 1000,
})
const municipalityWithCodeCache: Cache = newCache({
  expire: 3600,
  size: 1000,
})
const municipalityWithNameCache: Cache = newCache({
  expire: 3600,
  size: 1000,
})
const parentTypeCache: Cache = newCache({
  expire: 3600,
  size: 2000,
})

let changeQueue: EnonicEventData['nodes'] = []
let clearTaskId: string | undefined

export function setup(): void {
  cacheLog('initializing cache node listener')
  listener({
    type: 'node.*',
    localOnly: false,
    callback: addToChangeQueue,
  })

  listener({
    type: 'node.pushed',
    localOnly: false,
    callback: removePageFromVarnish,
  })

  listener({
    type: 'custom.clearCache',
    callback: (e: EnonicEvent<CompletelyClearCacheOptions>) => completelyClearCache(e.data),
  })

  listener({
    type: 'custom.clearDatasetCache',
    callback: (e: EnonicEvent<{ path: string }>) => {
      clearCacheRepo(e.data.path)
    },
  })
}

function removePageFromVarnish(event: EnonicEvent<EnonicEventData>): void {
  const pageIds: string[] = event.data.nodes
    .filter((n) => n.repo == 'com.enonic.cms.default' && n.branch == 'master' && n.path.startsWith('/content/'))
    .map((n) => n.id)

  if (pageIds.length > 0) {
    const taskConfig = {
      pageIds,
    }

    const taskId: string = submitTask({
      descriptor: `banVarnishPageCache`,
      config: taskConfig,
    })
    log.debug(`Page submitted for Varnish ban. Task id: ${taskId}`)
  }
}

const validRepos: Array<string> = [ENONIC_CMS_DEFAULT_REPO, DATASET_REPO]
function addToChangeQueue(event: EnonicEvent<EnonicEventData>): void {
  cacheLog(`cacheEvent :: ${JSON.stringify(event, null, 2)}`)
  const validNodes: EnonicEventData['nodes'] = event.data.nodes.filter(
    (n) => validRepos.includes(n.repo) && !n.path.includes('/issues/')
  )
  if (validNodes.length > 0) {
    cacheLog(`cacheValidNodes :: ${JSON.stringify(validNodes, null, 2)}`)
    changeQueue = changeQueue.concat(validNodes)
    addClearTask()
  }
}

function addClearTask(): void {
  if (clearTaskId) {
    cacheLog(`cache :: task already running`)
    return
  }
  cacheLog(`cache :: start new task`)
  const changeQueueLength: number = changeQueue.length
  clearTaskId = executeFunction({
    description: 'check cache clearing in mimir',
    func: () => {
      try {
        sleep(250)
        if (changeQueueLength === changeQueue.length) {
          cacheLog(`cache :: clear queue ${changeQueue.length}`)
          const changedNodes: EnonicEventData['nodes'] = changeQueue
          changeQueue = [] // reset queue
          if (changeQueueLength >= 200) {
            // just clear everything if there is too many changes
            log.info('Cache - changeQueueLength >= 200, clear everything')
            completelyClearCache({
              clearFilterCache: true,
              clearMenuCache: true,
              clearRelatedArticlesCache: true,
              clearRelatedFactPageCache: true,
              clearDatasetRepoCache: true,
              clearParsedMunicipalityCache: true,
              clearMunicipalityWithCodeCache: true,
              clearMunicipalityWithNameCache: true,
              clearParentTypeCache: true,
              clearSubjectCache: true,
              clearPartCache: true,
            })
          } else {
            onNodeChange(changedNodes)
          }
          clearTaskId = undefined
        } else {
          cacheLog(`cache :: queue changed try again in 250ms`)
          clearTaskId = undefined
          addClearTask()
        }
      } catch (error) {
        cacheLog(`cacheError :: ${error.toString()} :: ${error.printStackTrace()}`)
        clearTaskId = undefined
        addClearTask()
      }
    },
  })
}

function onNodeChange(validNodes: EnonicEventData['nodes']): void {
  const draftNodes: EnonicEventData['nodes'] = validNodes.filter((n) => n.branch === 'draft')
  if (draftNodes.length > 0) {
    clearForBranch(draftNodes, 'draft')
  }
  const masterNodes: EnonicEventData['nodes'] = validNodes.filter((n) => n.branch === 'master')
  if (masterNodes.length > 0) {
    cacheLog(`cache :: master nodes to clear :: ${JSON.stringify(masterNodes, null, 2)}`)
    clearForBranch(masterNodes, 'master')
  }
}

function clearForBranch(nodes: EnonicEventData['nodes'], branch: string): void {
  // need to run in correct context for getReferences to work
  run(
    {
      repository: ENONIC_CMS_DEFAULT_REPO,
      branch: branch,
      user: {
        login: 'su',
        idProvider: 'system',
      },
      principals: ['role:system.admin'],
    },
    () => {
      const cleared: Array<string> = []
      cacheLog(`cache :: nodes to clear for branch ${branch} :: ${JSON.stringify(nodes, null, 2)}`)
      nodes.forEach((n) => {
        if (n.repo === ENONIC_CMS_DEFAULT_REPO) {
          // clear id and all references to id from cache
          cacheLog(`try to clear ${n.id}(${branch})`)
          const content: Content | null = get({
            key: n.id,
          })
          if (content) {
            clearCache(content, branch, cleared)
          } else {
            // the element is deleted, so lets try to clear it only based on id, and its parent
            clearCache(
              {
                _id: n.id,
              } as Content,
              branch,
              cleared
            )
            // the path on these nodes are not site, but repo relative, so we need to strip out the /content at the start
            const parentPath: string = n.path.substring('/content'.length, n.path.lastIndexOf('/'))
            const parent: Content | null = get({
              key: parentPath,
            })
            if (parent) {
              clearCache(parent, branch, cleared)
            }
          }
        } else if (n.repo === DATASET_REPO) {
          cacheLog(`cache :: try to clear in dataset repo :: ${JSON.stringify(n, null, 2)}`)
          clearCacheRepo(n.path)
        }
      })
    }
  )
}

function getReferences(id: string): Array<Content> {
  let start = 0
  let count = 10
  let hits: Array<Content> = []
  while (count === 10) {
    const result = query({
      start,
      count,
      query: `_references LIKE "${id}"`,
    })
    count = result.count
    start += count
    hits = hits.concat(result.hits)
  }
  return hits
}

function clearCache(content: Content, branch: string, cleared: Array<string>): Array<string> {
  if (cleared.filter((c) => content._id === c).length > 0) {
    // already cleared
    cacheLog(`already cleared ${content._id}(${branch})`)
    return cleared
  }
  cleared.push(content._id)

  // try to clear filter cache
  const cacheMap: Map<string, Cache> = branch === 'master' ? masterFilterCaches : draftFilterCaches
  const filterCache: Cache | undefined = cacheMap.get(content._id)
  if (filterCache) {
    cacheLog(`clear ${content._id} filter cache(${branch})`)
    filterCache.clear()
  }

  // clear related article cache
  if (content.type === `${app.name}:article`) {
    const relatedArticlesCache: Cache = branch === 'master' ? masterRelatedArticlesCache : draftRelatedArticlesCache
    cacheLog(`clear ${content._id} from related articles cache (${branch})`)
    relatedArticlesCache.remove(content._id)
  }

  // clear related fact page cache
  if (content.type === `${app.name}:contentList` || content.type === `${app.name}:page`) {
    const relatedFactPageCache: Cache = branch === 'master' ? masterRelatedFactPageCache : draftRelatedFactPageCache
    cacheLog(`clear ${content._id} from related fact page cache (${branch})`)
    relatedFactPageCache.remove(content._id)
  }

  // clear menu cache
  if (content.type === `${app.name}:menuItem`) {
    completelyClearMenuCache(branch)
  }

  const references: Array<Content> = getReferences(content._id)
  references.forEach((ref) => {
    cacheLog(`try to clear reference ${ref._id} to ${content._id}(${branch})`)
    clearCache(ref, branch, cleared)
  })

  clearSubjectCache(content, branch)
  clearPartCache(content, branch)

  return cleared
}

function clearCacheRepo(path: string): void {
  cacheLog(`clear ${path} from dataset repo cache`)
  datasetRepoCache.remove(path)
}

function getFilterCache(branch: string, filterKey: string): Cache {
  const cacheMap: Map<string, Cache> = branch === 'master' ? masterFilterCaches : draftFilterCaches
  let filterCache: Cache | undefined = cacheMap.get(filterKey)
  if (!filterCache) {
    filterCache = newCache({
      size: 1000,
      expire: 3600,
    })
    cacheMap.set(filterKey, filterCache)
  }
  return filterCache
}

export function fromFilterCache(
  req: XP.Request,
  filterKey: string,
  key: string,
  fallback: () => XP.Response
): XP.Response {
  if (req.mode === 'live' || req.mode === 'preview') {
    const branch: string = req.mode === 'live' ? 'master' : 'draft'
    const filterCache: Cache = getFilterCache(branch, filterKey)
    return filterCache.get(key, () => {
      cacheLog(`added ${key} to ${filterKey} filter cache (${branch})`)
      return fallback()
    })
  }
  return fallback()
}

export function fromMenuCache(req: XP.Request, key: string, fallback: () => unknown): unknown {
  if (req.mode === 'live') {
    const branch: string = req.mode === 'live' ? 'master' : 'draft'
    const menuCache: Cache = branch === 'master' ? masterMenuCache : draftMenuCache
    return menuCache.get(key, () => {
      cacheLog(`added ${key} to menu cache (${branch})`)
      return fallback()
    })
  }
  return fallback()
}

export function fromRelatedArticlesCache(req: XP.Request, key: string, fallback: () => unknown): unknown {
  if (req.mode === 'live') {
    const branch: string = req.mode === 'live' ? 'master' : 'draft'
    const relatedArticlesCache: Cache = branch === 'master' ? masterRelatedArticlesCache : draftRelatedArticlesCache
    return relatedArticlesCache.get(key, () => {
      cacheLog(`added ${key} to related articles cache (${branch})`)
      return fallback()
    })
  }
  return fallback()
}

export function fromDatasetRepoCache(
  key: string,
  fallback: () => DatasetRepoNode<JSONstat | TbmlDataUniform | object> | null
): DatasetRepoNode<JSONstat | TbmlDataUniform | object> | undefined {
  return datasetRepoCache.get(key, () => {
    cacheLog(`added ${key} to dataset repo cache`)
    const res: DatasetRepoNode<JSONstat | TbmlDataUniform | object> | null = fallback()
    // cant be null for some reason, so store it as undefined instead
    return res || undefined
  })
}

export function datasetOrUndefined(
  content: Content<DataSource>
): DatasetRepoNode<JSONstat | TbmlDataUniform | object> | undefined {
  return content.data.dataSource && content.data.dataSource._selected
    ? fromDatasetRepoCache(`/${content.data.dataSource._selected}/${extractKey(content)}`, () => getDataset(content))
    : undefined
}

export function fromParsedMunicipalityCache(
  key: string,
  fallback: () => Array<MunicipalityWithCounty>
): Array<MunicipalityWithCounty> {
  return parsedMunicipalityCache.get(key, () => {
    cacheLog(`added ${key} to parsed municipality cache`)
    return fallback()
  })
}

export function fromMunicipalityWithCodeCache(
  key: string,
  fallback: () => MunicipalityWithCounty | undefined
): MunicipalityWithCounty | undefined {
  return municipalityWithCodeCache.get(key, () => {
    cacheLog(`added ${key} to municipality with code cache`)
    return fallback()
  })
}

export function fromMunicipalityWithNameCache(
  key: string,
  fallback: () => MunicipalityWithCounty | undefined
): MunicipalityWithCounty | undefined {
  return municipalityWithNameCache.get(key, () => {
    cacheLog(`added ${key} to municipality with name cache`)
    return fallback()
  })
}

export function fromParentTypeCache(key: string, fallback: () => string | undefined): string | undefined {
  return parentTypeCache.get(key, () => {
    return fallback()
  })
}

function completelyClearFilterCache(branch: string): void {
  const cacheMap: Map<string, Cache> = branch === 'master' ? masterFilterCaches : draftFilterCaches
  cacheMap.forEach((cache: Cache, filterKey: string) => {
    cacheLog(`clear ${filterKey} filter cache(${branch})`)
    cache.clear()
    cacheMap.delete(filterKey)
  })
}

function completelyClearMenuCache(branch: string): void {
  cacheLog(`clear header/footer cache (${branch})`)
  const menuCache: Cache = branch === 'master' ? masterMenuCache : draftMenuCache
  menuCache.clear()
}

function completelyClearRelatedArticleCache(branch: string): void {
  cacheLog(`clear related article cache (${branch})`)
  const relatedArticlesCache: Cache = branch === 'master' ? masterRelatedArticlesCache : draftRelatedArticlesCache
  relatedArticlesCache.clear()
}

function completelyClearRelatedFactPageCache(branch: string): void {
  cacheLog(`clear related fact page cache (${branch})`)
  const relatedFactPageCache: Cache = branch === 'master' ? masterRelatedFactPageCache : draftRelatedFactPageCache
  relatedFactPageCache.clear()
}

function completelyClearDatasetRepoCache(): void {
  cacheLog(`clear dataset repo cache`)
  datasetRepoCache.clear()
}

function completelyClearParsedMunicipalityCache(): void {
  cacheLog(`clear parsed municipality cache`)
  parsedMunicipalityCache.clear()
}

function completelyClearMunicipalityWithCodeCache(): void {
  cacheLog(`clear municipality with code cache`)
  municipalityWithCodeCache.clear()
}

function completelyClearMunicipalityWithNameCache(): void {
  cacheLog(`clear municipality with name cache`)
  municipalityWithNameCache.clear()
}

function completelyClearParentTypeCache(): void {
  cacheLog(`clear parent type cache`)
  parentTypeCache.clear()
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

  if (options.clearRelatedArticlesCache) {
    completelyClearRelatedArticleCache('master')
    completelyClearRelatedArticleCache('draft')
  }

  if (options.clearRelatedFactPageCache) {
    completelyClearRelatedFactPageCache('master')
    completelyClearRelatedFactPageCache('draft')
  }

  if (options.clearDatasetRepoCache) {
    completelyClearDatasetRepoCache()
  }

  if (options.clearParsedMunicipalityCache) {
    completelyClearParsedMunicipalityCache()
  }

  if (options.clearMunicipalityWithCodeCache) {
    completelyClearMunicipalityWithCodeCache()
  }

  if (options.clearMunicipalityWithNameCache) {
    completelyClearMunicipalityWithNameCache()
  }

  if (options.clearParentTypeCache) {
    completelyClearParentTypeCache()
  }

  if (options.clearSubjectCache) {
    completelyClearSubjectCache('draft')
    completelyClearSubjectCache('master')
  }

  if (options.clearPartCache) {
    completelyClearPartCache('draft')
    completelyClearPartCache('master')
  }
}

export function setupHandlers(socket: Socket): void {
  socket.on('clear-cache', () => {
    log.info(`Clear XP Cache Dashboard`)
    send({
      type: 'clearCache',
      distributed: true,
      data: {
        clearFilterCache: true,
        clearMenuCache: true,
        clearRelatedArticlesCache: true,
        clearRelatedFactPageCache: true,
        clearDatasetRepoCache: true,
        clearParsedMunicipalityCache: true,
        clearMunicipalityWithCodeCache: true,
        clearMunicipalityWithNameCache: true,
        clearSubjectCache: true,
        clearPartCache: true,
      },
    })

    socket.emit('clear-cache-finished', {})
  })

  socket.on('purge-varnish', () => {
    const resultOfPurge: HttpResponse = purgeVarnishCache()

    // Keeping log line, we want to be able to track use of this button
    log.info(`Cleared Varnish. Result code: ${resultOfPurge.status} - and message: ${resultOfPurge.message}`)
    const statusMessage: string =
      resultOfPurge.status === 200 ? 'Status: OK' : `Status: Feilet ${resultOfPurge.status}: ${resultOfPurge.message}`

    socket.emit('purge-varnish-finished', {
      status: statusMessage,
    })
  })
}

function purgeVarnishCache(): HttpResponse {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const baseUrl: string =
    app.config && app.config['ssb.internal.baseUrl'] ? app.config['ssb.internal.baseUrl'] : 'https://i.ssb.no'
  const response: HttpResponse = request({
    url: `${baseUrl}/xp_clear`,
    method: 'PURGE',
    connectionTimeout: 5000,
    readTimeout: 5000,
  })
  return response
}

export interface CompletelyClearCacheOptions {
  clearFilterCache: boolean
  clearMenuCache: boolean
  clearRelatedArticlesCache: boolean
  clearRelatedFactPageCache: boolean
  clearDatasetRepoCache: boolean
  clearParsedMunicipalityCache: boolean
  clearMunicipalityWithCodeCache: boolean
  clearMunicipalityWithNameCache: boolean
  clearParentTypeCache: boolean
  clearSubjectCache: boolean
  clearPartCache: boolean
}

export interface SSBCacheLibrary {
  setup: () => void
  fromFilterCache: (req: XP.Request, filterKey: string, key: string, fallback: () => XP.Response) => XP.Response
  fromMenuCache: (req: XP.Request, key: string, fallback: () => unknown) => unknown
  fromRelatedArticlesCache: (req: XP.Request, key: string, fallback: () => unknown) => unknown
  fromDatasetRepoCache: (
    key: string,
    fallback: () => DatasetRepoNode<JSONstat | TbmlDataUniform | object> | null
  ) => DatasetRepoNode<JSONstat | TbmlDataUniform | object> | undefined
  fromParsedMunicipalityCache: (
    key: string,
    fallback: () => Array<MunicipalityWithCounty>
  ) => Array<MunicipalityWithCounty>
  fromMunicipalityWithCodeCache: (
    key: string,
    fallback: () => MunicipalityWithCounty | undefined
  ) => MunicipalityWithCounty | undefined
  fromMunicipalityWithNameCache: (
    key: string,
    fallback: () => MunicipalityWithCounty | undefined
  ) => MunicipalityWithCounty | undefined
  fromParentTypeCache: (path: string, fallback: () => string | undefined) => string | undefined
  datasetOrUndefined: (content: Content<DataSource>) => DatasetRepoNode<JSONstat | TbmlDataUniform | object> | undefined
  setupHandlers: (socket: Socket) => void
}
