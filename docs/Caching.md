# Caching
## Cache Architecture
Enonic XP does not automatically cache any content. We use Enonic's [cache library](https://developer.enonic.com/docs/cache-library/master) to achieve caching.

Cache instantiation and control is found in [cache.ts](/src/main/resources/lib/ssb/cache/cache.ts).

## Clearing Cache
Clearing cache is primarily done on node events, which is set up in the *cache.ts* file. When content is saved or published, content nodes are placed in a queue. When the queue is stable, all the contents are individually cleared - or all cache is cleared if there are too many contents.
### Dashboard
For manual cache clearing, there is a `Tøm cache` button in the `Dashboard` admin tool XP application for internal users to interact with. That button will trigger a set of events using websocket and Enonic's event library, clearing all the entries from a list of our predefined cached instances. This function is often utilized after PROD deploys, or if data is not being retrieved or displayed correctly after the scheduled jobs have finished running.

When the `Tøm cache` button is pressed, the `clear-cache` event will get emitted. The following function is called at `onClick`
([actions.es6](src/main/resources/react4xp/dashboard/containers/HomePage/actions.es6)):
 ```javascript
 export function requestClearCache(dispatch, io) {
  dispatch({
    type: actions.startLoadingClearCache.type
  })

  io.emit('clear-cache')
}
 ```

After the `clear-cache` event is emitted from the Dashboard, the socket listener in [cache.ts](src/main/resources/lib/ssb/cache/cache.ts) will then send a `clearCache` custom event to the cluster, passing along with it a list of booleans representing cached items to `data`:
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

`clearCache`'s custom event listener will then completely clear all the entries from the cached instances defined in `data`:
 ```javascript
listener({
  type: 'custom.clearCache',
  callback: (e: EnonicEvent<CompletelyClearCacheOptions>) => completelyClearCache(e.data)
})
 ```

### Clear Cache Cron
Every hour, there is a clear cache cron job that is scheduled to run. The scheduled time can be adjusted in the `mimir.cfg` and fallbacks to every hour. Its purpose is to automatically clear part caches from draft and master so that when data is updated from the server, the changes will display on the affected parts correctly.

The following parts will clear all the entries from their respective part cache instances every hour ([cron.ts](src/main/resources/lib/ssb/cron/cron.ts)):

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
      clearPartFromPartCache('articleList')
      clearPartFromPartCache('archiveAllPublications-nb')
      clearPartFromPartCache('archiveAllPublications-en')
    },
    context: cronContext
  })
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
- [x] Merge relatedArticlesCache with partsCache
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
