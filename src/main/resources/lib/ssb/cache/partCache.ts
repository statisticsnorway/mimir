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

export function fromPartCache<T>(req: Request, key: string, fallback: () => T): T {
  const partCache: Cache = req.branch === 'master' ? masterPartCache : draftPartCache
  return partCache.get(key, () => {
    cacheLog(`added ${key} to part cache (${req.branch})`)
    return fallback()
  })
}

export function clearPartCache(content: Content, branch: string): void {
  const partCache: Cache = branch === 'master' ? masterPartCache : draftPartCache
  if (content.type === `${app.name}:page` || content.type === `portal:site` || content.type === `${app.name}:statistics`) {
    cacheLog(`try to clear ${content._id}-kpiCalculator from part cache (${branch})`)
    partCache.remove(`${content._id}-kpiCalculator`)
    cacheLog(`try to clear ${content._id}-pifCalculator from part cache (${branch})`)
    partCache.remove(`${content._id}-pifCalculator`)
    cacheLog(`try to clear ${content._id}-bkibolCalculator from part cache (${branch})`)
    partCache.remove(`${content._id}-bkibolCalculator`)
    cacheLog(`try to clear ${content._id}-husleieCalculator from part cache (${branch})`)
    partCache.remove(`${content._id}-husleieCalculator`)
    cacheLog(`try to clear ${content._id}-releasedStatistics from part cache (${branch})`)
    partCache.remove(`${content._id}-releasedStatistics`)
    cacheLog(`try to clear ${content._id}-omStatistikken from part cache (${branch})`)
    partCache.remove(`${content._id}-omStatistikken`)
    cacheLog(`try to clear ${content._id}-upcomingReleases from part cache (${branch})`)
    partCache.remove(`${content._id}-upcomingReleases`)
  }
}

export function completelyClearPartCache(): void {
  cacheLog(`clear part cache (draft and master)`)
  masterPartCache.clear()
  draftPartCache.clear()
}

export function clearPartFromPartCache(part: string): void {
  cacheLog(`clear ${part} from part cache (draft and master)`)
  masterPartCache.removePattern(`.*${part}`)
  draftPartCache.removePattern(`.*${part}`)
}

export interface SSBPartCacheLibrary {
  fromPartCache: <T>(req: Request, key: string, fallback: () => T) => T;
  clearPartCache: (content: Content, branch: string) => void;
  completelyClearPartCache: () => void;
  clearPartFromPartCache: (part: string) => void;
}
