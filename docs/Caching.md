# Caching
## Cache Architecture
Enonic XP does not automatically cache any content. We use Enonic's [cache library](https://developer.enonic.com/docs/cache-library/master) to achieve caching.

Cache instantiation and control is found in [cache.ts](/src/main/resources/lib/ssb/cache/cache.ts).

## Clearing Cache
Clearing cache is primarily done on node events, which is set up in the *cache.ts* file. When content is saved or published, content nodes are placed in a queue. When the queue is stable, all the contents are individually cleared - or all cache is cleared if there are too many contents.
### Dashboard
For manual cache clearing, there is a `Tøm XP cache` button in the `Dashboard` admin tool XP application for internal users to interact with. That button will trigger a set of events using websocket and Enonic's event library, clearing all the entries from a list of our predefined cached instances. This function is often utilized after PROD deploys, or if data is not being retrieved or displayed correctly after the scheduled jobs have finished running.

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


## Do's and don't's
It is important that the cache key (first parameter you give to `cache.get`) contains a list of dependancies of the thing you want to cache.

Here is list of things to put in the cache key and tips on when:

* `content._id` - When it is dependent on content or part config.
* `content.modifiedTime` - When you want it invalidated when content or part changes.
* `site._id` - When it is dependent on siteConfig. (You reuse the cache across different sites, both use same app).
* `site.modifiedTime` - When you want it invalidated when siteConfig changes (You reuse the cache across different sites, both use same app).
* `req.mode` - You are generating URLs through portal functions.
* `req.branch` - Almost always include this. If what is cached is dependent on any content or config at all (that is stored in branches in default repo). 
* contentProject id - When you are using the same app across different content projects.
* TODO - Add a tip for content variants when we get to XP 7.12.x


Some of these can be excempt if you use events to clear cache, especially `modifiedTime`.


### Pitfalls
#### URLs
All URL's generated by portal functions in XP, e.g. assetURL, pageURL are mode (`live`, `inline`, `edit`, `preview`), branch (`draft`, `master`) and content-project (`default` usually) dependant. 

Take this URL:
`/xp/admin/site/preview/default/draft/_/asset/mimir:000001879e657530/js/bundle.js`

It is built like this:

`/xp/admin/site/[MODE]/[CONTENT_PROJECT]/[BRANCH]/_/asset/mimir:000001879e657530/js/bundle.js`.

Most URLs will work cross modes, but not JS (see example 2). It is important to not mix branches and content-projects. If you do not include these dependancies in your cache key you might get broken links.

Examples:
1. draft URL appearing on a master page, linking to a page that is not published.
2. Since URL's are sligtly different, pageContributions include them all. Included a JS files multiple times can cause errors. Including React4xp JS files more than once will cause parts to not render. If there is 2 of `externals.js` included it will fail with a react error 321, since there is then 2 reacts on the page.
3. admin/site (or other content studio links) URLs appearing on the live site at ssb.no. These will be broken URLs 
`www.ssb.no/admin/site...`

#### JavaScript Object

We often put JavaScript objects in the cache and thus it is important to remember that they are "alive". If you get it from the cache and in your code you modify the object, it will also be reflected in the cache. Next time you get from the cache you will get the modified object.

```typescript
const myObject = cache.get("abc", { a: [1,2,3] });

myObject.a.push(4);
myObject.b = "hei";

....
// another part

const myObject = cache.get("abc", ...);
log.info(myObject)
// { a: [1,2,3,4], b: "hei" }

```

This can lead to issue where the cache continues to grow in size, eventually causing a OutOfMemoryError on the node. 


## Future  
### Cache Lib
- [ ] Increase expire for some caches
- [ ] Merge relatedArticlesCache with partsCache
- [x] Merge relatedFactPageCache with partsCache
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
