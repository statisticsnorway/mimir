import { Content, query } from '/lib/xp/content'
import { pageUrl } from '/lib/xp/portal'
import { render } from '/lib/thymeleaf'
import { subDays } from '/lib/vendor/dateFns'
import { Article, Page, Statistics } from '/site/content-types'

export const get = (): XP.Response => {
  const yesterday: string = subDays(new Date(), 1).toISOString()
  const baseUrl: string = app.config && app.config['ssb.baseUrl'] ? app.config['ssb.baseUrl'] : 'https://www.ssb.no'

  const changedContent = query<Content<Statistics | Article | Page>>({
    start: 0,
    count: 500,
    sort: 'modifiedTime DESC',
    query: `modifiedTime >= dateTime('${yesterday}') OR publish.from >= dateTime('${yesterday}')`,
    contentTypes: [`${app.name}:statistics`, `${app.name}:article`, `${app.name}:page`],
  })

  const urls: string[] = changedContent.hits.map((content) => {
    return (
      baseUrl +
      pageUrl({
        path: content._path,
      })
    )
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
