__non_webpack_require__('/lib/ssb/polyfills/nashorn')
import { Content } from 'enonic-types/content'
import { Cache } from 'enonic-types/cache'
import { Request } from 'enonic-types/controller'

const {
  newCache
} = __non_webpack_require__('/lib/cache')
const {
  cacheLog
} = __non_webpack_require__('/lib/ssb/utils/serverLog')

const masterPartCache: Cache = newCache({
  expire: 3600,
  size: 1000
})
const draftPartCache: Cache = newCache({
  expire: 3600,
  size: 1000
})

export function fromPartCache<T>(req: Request, key: string, fallback: () => Array<T>): Array<T> {
  const partCache: Cache = req.branch === 'master' ? masterPartCache : draftPartCache
  return partCache.get(key, () => {
    cacheLog(`added ${key} to part cache (${req.branch})`)
    return fallback()
  })
}

export function clearPartCache(content: Content, branch: string): void {
  const partCache: Cache = branch === 'master' ? masterPartCache : draftPartCache
  if (content.type === `${app.name}:page` || content.type === `portal:site`) {
    cacheLog(`try to clear ${content._id}-releasedStatistics from part cache (${branch})`)
    partCache.remove(`${content._id}-releasedStatistics`)
  }
}

export function completelyClearPartCache(branch: string): void {
  cacheLog(`clear part cache (${branch})`)
  const partCache: Cache = branch === 'master' ? masterPartCache : draftPartCache
  partCache.clear()
}

export interface SSBPartCacheLibrary {
  fromPartCache: <T>(req: Request, key: string, fallback: () => Array<T>) => Array<T>;
  clearPartCache: (content: Content, branch: string) => void;
  completelyClearPartCache: (branch: string) => void;
}
