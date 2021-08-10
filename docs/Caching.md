# Caching
## Cache architecture
Enonic XP does not automatically cache any content. We use Enonic's [cache library](https://developer.enonic.com/docs/cache-library/master) to acieve caching. 

Cache instatiation and control is found in [cache.ts](/src/main/resources/lib/ssb/cache/cache.ts). 

## Clearing cache
Clearing cache is primarily done on node events, which is set up in the *cache.ts* file. When content is saved or published, content nodes are placed in a queue. When the queue is stable, all the contents are individually cleared - or all cache is cleared if there are too many contents. 

## Creating cache
Some parts are cached on first render, and always fetched from cache, while others are cached individually by language, or the page they are rendered on. For instance, in the get function of [Statbank Subject Tree controller](/src/main/resources/site/parts/statbankSubjectTree/statbankSubjectTree.ts) , we check if the page is viewed in edit mode, and if not, return any existing cached version of the page, in the correct language. 

```javascript
if (isNotInEditMode) {
    return fromPartCache(req, `statbankSubjectTree-${content.language}`, () => {
      return getStatbankSubjectTree(req, content)
    })
  } else {
    return getStatbankSubjectTree(req, content)
  }
  ```
  