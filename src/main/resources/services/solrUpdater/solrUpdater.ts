import { Content, query } from '/lib/xp/content'
import { pageUrl } from '/lib/xp/portal'
import { render } from '/lib/thymeleaf'
import { subDays, format } from '/lib/vendor/dateFns'
import { Article, Page, Statistics } from '/site/content-types'

export const get = (): XP.Response => {
  const yesterday: string = subDays(new Date(), 1).toISOString()
  const changedContent = query<Content<Statistics | Article | Page>>({
    start: 0,
    count: 500,
    sort: 'modifiedTime DESC',
    query: `modifiedTime >= dateTime('${yesterday}') OR publish.from >= dateTime('${yesterday}')`,
    contentTypes: [`${app.name}:statistics`, `${app.name}:article`, `${app.name}:page`],
  })

  log.info(
    `Found ${changedContent.hits.length} changed content items for the solrUpdater service since yesterday: ${format(yesterday, 'yyyy-MM-dd HH:mm')} (${yesterday}).`
  )

  const urls: string[] = changedContent.hits.map((content) => {
    return pageUrl({
      path: content._path,
      type: 'absolute',
    })
  })

  const template = resolve('./solrUpdater.html')
  const model: urlModel = {
    urls: urls,
  }

  return {
    body: render(template, model),
    contentType: 'text/html',
  }
}

interface urlModel {
  urls: Array<string>
}
