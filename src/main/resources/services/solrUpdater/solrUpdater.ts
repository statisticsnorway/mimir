import { query, Content, QueryResponse } from '/lib/xp/content'
import { ResourceKey, render } from '/lib/thymeleaf'
import { subDays, format } from '/lib/ssb/utils/dateUtils'

const yesterday: string = format(subDays(new Date(), 1), 'yyyy-MM-dd')
const baseUrl: string = app.config && app.config['ssb.baseUrl'] ? app.config['ssb.baseUrl'] : 'https://www.ssb.no'

exports.get = (): XP.Response => {
  const changedContent: QueryResponse<Content, object> = query({
    start: 0,
    count: 100,
    sort: 'modifiedTime DESC',
    query: `modifiedtime >= date('${yesterday}')`,
    contentTypes: [`${app.name}:statistics`, `${app.name}:article`, `${app.name}:page`],
  })

  const urls: string[] = changedContent.hits.map((content) => {
    return baseUrl + content._path.slice(4) // trim off leading '/ssb' from path
  })

  const template: ResourceKey = resolve('./solrUpdater.html') as ResourceKey
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
