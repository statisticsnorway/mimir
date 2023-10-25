__non_webpack_require__('/lib/ssb/polyfills/nashorn')
import { Content } from '/lib/xp/content'
import { newCache, Cache } from '/lib/cache'

import { cacheLog } from '/lib/ssb/utils/serverLog'

const masterPartCache: Cache = newCache({
  expire: 3600,
  size: 1000,
})
const draftPartCache: Cache = newCache({
  expire: 3600,
  size: 1000,
})

export function fromPartCache<T>(req: XP.Request, key: string, fallback: () => T): T {
  const partCache: Cache = req.branch === 'master' ? masterPartCache : draftPartCache
  const _key = key + `-${req.mode}`
  return partCache.get(_key, () => {
    cacheLog(`added ${_key} to part cache (${req.branch})`)
    return fallback()
  })
}

export function clearPartCache(content: Content, branch: string): void {
  const partCache: Cache = branch === 'master' ? masterPartCache : draftPartCache
  if (
    content.type === `${app.name}:page` ||
    content.type === `portal:site` ||
    content.type === `${app.name}:statistics`
  ) {
    cacheLog(`try to clear ${content._id}-kpiCalculator from part cache (${branch})`)
    partCache.removePattern(`${content._id}-kpiCalculator.*`)
    cacheLog(`try to clear ${content._id}-pifCalculator from part cache (${branch})`)
    partCache.removePattern(`${content._id}-pifCalculator.*`)
    cacheLog(`try to clear ${content._id}-bkibolCalculator from part cache (${branch})`)
    partCache.removePattern(`${content._id}-bkibolCalculator.*`)
    cacheLog(`try to clear ${content._id}-husleieCalculator from part cache (${branch})`)
    partCache.removePattern(`${content._id}-husleieCalculator.*`)
    cacheLog(`try to clear ${content._id}-releasedStatistics from part cache (${branch})`)
    partCache.removePattern(`${content._id}-releasedStatistics.*`)
    cacheLog(`try to clear ${content._id}-omStatistikken from part cache (${branch})`)
    partCache.removePattern(`${content._id}-omStatistikken.*`)
    cacheLog(`try to clear ${content._id}-upcomingReleases from part cache (${branch})`)
    partCache.removePattern(`${content._id}-upcomingReleases.*`)
    cacheLog(`try to clear ${content._id}-articleList from part cache (${branch})`)
    partCache.removePattern(`${content._id}-articleList.*`)
    cacheLog(`try to clear ${content._id}-relatedFactPage from part cache (${branch})`)
    partCache.removePattern(`${content._id}-relatedFactPage.*`)
  }

  if (content.type === `${app.name}:article`) {
    cacheLog(`try to clear ${content._id}-relatedFactPage from part cache (${branch})`)
    partCache.removePattern(`${content._id}-relatedFactPage.*`)
  }
}

export function completelyClearPartCache(branch: string): void {
  cacheLog(`clear part cache (${branch})`)
  const partCache: Cache = branch === 'master' ? masterPartCache : draftPartCache
  partCache.clear()
}

export function clearPartFromPartCache(part: string): void {
  cacheLog(`clear ${part} from part cache (draft and master)`)
  masterPartCache.removePattern(`.*${part}.*`)
  draftPartCache.removePattern(`.*${part}.*`)
}
