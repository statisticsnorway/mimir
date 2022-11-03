# Performance tips

The main performance gains can be realized by improved use of the database. 

Every developer should be intimately familiar
with all of the [XP-documentation about storage](https://developer.enonic.com/docs/xp/stable/storage). 

## 1. Only fetch what you need

Minimize work in application code by only fetching what you need. The application code should not need to `filter()`, 
`slice()` or `sort()` the results. The database is much faster at this.

If the content in the database doesn't have the necessary value for filtering, the content can be enriched with the 
necessary data.

## 2. Use filters

Use [filters](https://developer.enonic.com/docs/xp/stable/storage/filters) instead of [query](https://developer.enonic.com/docs/xp/stable/storage/noql)
when doing boolean lookups as it has better performance.

### Querying for unions of different content types

You can use the [should boolean filter](https://developer.enonic.com/docs/xp/stable/storage/filters#boolean) to get
OR-semantics in your filters.

The documentation for `should` says:

> One or more of the functions in the should array must evaluate to true for the filter to match

This lets us create different filters for each content-type we want to match

```typescript
const res = query({
  start,
  count,
  filters: {
    boolean: {
      // mandatory filters for all types
      must: [
        {
          hasValue: {
            field: 'language',
            values: language === 'en' ? ['en'] : ['no', 'nb', 'nn']
          }
        }
      ],
      // One of the two following blocks must evaluate to true
      should: [
        // option 1 (statistics)
        {
          boolean: {
            must: [
              // option 1 will only look at "mimir:statistics"
              {
                hasValue: {
                  field: 'type',
                  values: [`${app.name}:statistics`]
                }
              },
              // in this example, we are only interrested in results where aboutTheStatistics is specified
              {
                exists: {
                  field: 'data.aboutTheStatistics'
                }
              },
            ]
          }
        },
        // option 2 (article)
        {
          boolean: {
            must: [
              // option 2 will only look at "mimir:article"
              {
                hasValue: {
                  field: 'type',
                  values: [`${app.name}:article`]
                }
              },
              // in this case the value of `mainSubjects` must be found in the values-array
              {
                hasValue: {
                  field: 'x.mimir.subjects.mainSubjects',
                  values: forceArray(subject)
                }
              }
            ]
          }
        }
      ]
    }
  }
})
```

### Querying for data in different repos at once

If your results are supposed to contain data from different repos (e.g normal content in "com.enonic.cms.default" + repo 
created by *repoLib*), you can use `nodeLib.multiRepoConnect()` to search in multple repos at once.

Remember to search in the context that your user is in, by using `get()` from `"/lib/xp/context"`.

```typescript
import { get as getContext } from '/lib/xp/context'

const context = getContext()

const connection: MultiRepoConnection = multiRepoConnect({
  sources: [
    // query in the normal content
    {
      repoId: context.repository,
      branch: context.branch,
      principals: context.authInfo.principals
    },
    // also query in your own repo at the same time
    {
      repoId: 'no.ssb.statreg.statistics.variants', 
      branch: 'master',
      principals: context.authInfo.principals
    }
  ]
})

connection.query({
  ...
})
```

## 3. Don't to `contentLib.get()` in loops

When you need to get multiple content based on ids, do not fetch one-and-one. There is a cost of going back-and-forward
between application code and the database.

Instead use a `query()` with an `ids` filter:

```typescript
const results = query({
  count: ids.length,
  filters: {
    ids: {
      values: ids
    }
  }
})


```

I often like creating a `Record<string, Content>` with the result of an `ids` query, so that when I need to use the 
results I can just use the `id` as the key in the record.

You can use this utility function to create a record from id to content:

> **Note** This works with both results from contentLib and nodeLib

```typescript
export function contentArrayToRecord<Hit extends { _id: string }>(
  arr: ReadonlyArray<Hit>,
  getKey: (hit: Hit) => string = (hit) => hit._id
): Record<string, Hit> {
  return arr.reduce<Record<string, Hit>>((record, hit) => {
    record[getKey(hit)] = hit
    return record
  }, {})
}
```

Example:

```typescript
declare const statistics: Content<Statistics>[];

const ids = statistics
  .map((stat) => stat.data.aboutTheStatistics)
  .filter(notNullOrUndefined)

const results = query({
  count: ids.length,
  filters: {
    ids: {
      values: ids
    }
  }
})

const aboutTheStatisticsMap = contentArrayToRecord(results.hits)

const enrichedStatistics = statistics.map((stat) => {
  return {
    title: stat.displayName,
    about: stat.data.aboutTheStatistics 
      // we can very easily look up a value from the Record by the key
      ? aboutTheStatisticsMap[stat.data.aboutTheStatistics] 
      : undefined
  }
})
```

## 4. Do work up front

If there is a lot of calculation being done on a get-request, maybe that work could have been done at an earlier
time, and we only need query the result at request time.

We could:
1. Enrich the `Content` with more data
2. Process the data before updating a repo with it
3. Create a new repo with derived data, which is being updated using `"/lib/xp/event"`.
