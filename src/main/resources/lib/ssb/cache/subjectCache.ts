__non_webpack_require__('/lib/ssb/polyfills/nashorn')
import { Content } from '/lib/xp/content'
import { newCache, Cache } from '/lib/cache'

const {
  cacheLog
} = __non_webpack_require__('/lib/ssb/utils/serverLog')

const masterSubjectCache: Cache = newCache({
  expire: 3600,
  size: 25
})
const draftSubjectCache: Cache = newCache({
  expire: 3600,
  size: 25
})

export function fromSubjectCache<T>(req: XP.Request, key: string, fallback: () => Array<T>): Array<T> {
  const subjectCache: Cache = req.branch === 'master' ? masterSubjectCache : draftSubjectCache
  return subjectCache.get(key, () => {
    cacheLog(`added ${key} to subject cache (${req.branch})`)
    return fallback()
  })
}

export function clearSubjectCache(content: Content, branch: string): void {
  if (content.type === `${app.name}:page`) {
    const subjectCache: Cache = branch === 'master' ? masterSubjectCache : draftSubjectCache
    subjectCache.clear()
  }
}

export function completelyClearSubjectCache(branch: string): void {
  cacheLog(`clear subject cache (${branch})`)
  const subjectCache: Cache = branch === 'master' ? masterSubjectCache : draftSubjectCache
  subjectCache.clear()
}

export interface SSBSubjectCacheLibrary {
  fromSubjectCache: <T>(req: XP.Request, key: string, fallback: () => Array<T>) => Array<T>;
  clearSubjectCache: (content: Content, branch: string) => void;
  completelyClearSubjectCache: (branch: string) => void;
}
