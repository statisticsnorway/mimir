import { Content, query } from '/lib/xp/content'
import { render } from '/lib/thymeleaf'
import { subDays, format } from '/lib/ssb/utils/dateUtils'
import { Article, Page, Statistics } from '/site/content-types'

const yesterday: string = format(subDays(new Date(), 1), 'yyyy-MM-dd')
const baseUrl: string = app.config && app.config['ssb.baseUrl'] ? app.config['ssb.baseUrl'] : 'https://www.ssb.no'

export const get = (): XP.Response => {
  const changedContent = query<Content<Statistics | Article | Page>>({
    start: 0,
    count: 100,
    sort: 'modifiedTime DESC',
    query: `modifiedtime >= date('${yesterday}')`,
    contentTypes: [`${app.name}:statistics`, `${app.name}:article`, `${app.name}:page`],
  })

  const urls: string[] = changedContent.hits.map((content) => {
    return baseUrl + content._path.slice(4) // trim off leading '/ssb' from path
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
