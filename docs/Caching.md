# Caching
## Cache Architecture
Enonic XP does not automatically cache any content. We use Enonic's [cache library](https://developer.enonic.com/docs/cache-library/master) to achieve caching. 

Cache instantiation and control is found in [cache.ts](/src/main/resources/lib/ssb/cache/cache.ts). 

## Clearing Cache
Clearing cache is primarily done on node events, which is set up in the *cache.ts* file. When content is saved or published, content nodes are placed in a queue. When the queue is stable, all the contents are individually cleared - or all cache is cleared if there are too many contents.
### Dashboard
TBA

In [index.jsx](src/main/resources/react4xp/dashboard/containers/DashboardTools/index.jsx)
```javascript
  function clearCache() {
    requestClearCache(dispatch, io)
  }
 ```

[cache.ts](src/main/resources/lib/ssb/cache/cache.ts)
```javascript
export function setupHandlers(socket: Socket): void {
  socket.on('clear-cache', () => {
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
        clearPartCache: true
      }
    })

    socket.emit('clear-cache-finished', {})
  })
}
  ```

### Clear Cache Cron
Every hour there is a clear cache cron job that is scheduled to run. The scheduled time can be adjusted in the `mimir.cfg` and fallbacks to every hour. Its purpose is to automatically clear part caches from draft and master so that when data is updated, the changes will display on certain parts correctly.

A callback function is defined in the clear-cache `schedule` object, where a list of `clearCacheFromPartCache()` functions are called. Pass a key string to the function for the cached part that you wish to clear:

```javascript
  // clear specific cache once an hour
  const clearCacheCron: string = app.config && app.config['ssb.cron.clearCacheCron'] ? app.config['ssb.cron.clearCacheCron'] : '01 * * * *'
  schedule({
    name: 'clear cache',
    cron: clearCacheCron,
    callback: () => {
      clearPartFromPartCache('kpiCalculator')
      clearPartFromPartCache('pifCalculator')
      clearPartFromPartCache('bkibolCalculator')
      clearPartFromPartCache('husleieCalculator')
      clearPartFromPartCache('omStatistikken')
      clearPartFromPartCache('releasedStatistics')
      clearPartFromPartCache('upcomingReleases')
      clearPartFromPartCache('archiveAllPublications-nb')
      clearPartFromPartCache('archiveAllPublications-en')
    },
    context: cronContext
  })
 ```

`clearPartFromCache()` uses the `removePattern` function from `lib-cache` to remove a specified entry from the part cache:

 ```javascript
export function clearPartFromPartCache(part: string): void {
  cacheLog(`clear ${part} from part cache (draft and master)`)
  masterPartCache.removePattern(`.*${part}`)
  draftPartCache.removePattern(`.*${part}`)
}
 ```

## Creating cache
Some parts are cached on first render, and always fetched from cache, while others are cached individually by language, or the page they are rendered on. For instance, in the get function of [Statbank Subject Tree controller](/src/main/resources/site/parts/statbankSubjectTree/statbankSubjectTree.ts), we check if the page is viewed in edit mode, and if not, return any existing cached version of the page, in the correct language. 

```javascript
if (isNotInEditMode) {
  return fromPartCache(req, `statbankSubjectTree-${content.language}`, () => {
    return getStatbankSubjectTree(req, content)
  })
} else {
  return getStatbankSubjectTree(req, content)
}
  ```

## Future  
### Cache Lib
- [ ] Increase expire for some caches
- [ ] Merge relatedArticlesCache with partsCache
- [ ] Merge relatedFactPageCache with partsCache
- [ ] Move datasetRepoCache to seperate file
- [ ] Move municipalityCache to seperate file
- [ ] Move parentTypeCache to seperate file
- [ ] Move menuCache to seperate file
### Parts to cache
- [x] KPI calculator
- [x] Upcoming releases part ~300ms  
- [x] OmStatistikken part ~70ms  
- [ ] RelatedArticles part ~25-100ms  
- [ ] Default page ~10-60ms  
- [ ] AttachmentTableFigures part ~10-80ms  
- [ ] Statistics part ~30ms  
- [ ] LocalSearch part ~60ms  
- [x] PublicationArchive service ~100-150ms  
- [ ] Contact part ~20ms  
- [x] StatbankSubjectTree part ~600ms  
- [ ] RelatedStatistics part ~25-50ms  
- [x] Divider
