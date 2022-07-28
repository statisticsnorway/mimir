import { Content, QueryResponse } from 'enonic-types/content'
import { ResourceKey, render } from 'enonic-types/thymeleaf'

const {
  query
} = __non_webpack_require__('/lib/xp/content')
const {
  moment
} = __non_webpack_require__('/lib/vendor/moment')


const yesterday: string = moment().subtract(1, 'days').format('YYYY-MM-DD')
const baseUrl: string = app.config && app.config['ssb.baseUrl'] ? app.config['ssb.baseUrl'] : 'https://www.ssb.no'


exports.get = (): XP.Response => {
  const changedContent: QueryResponse<Content> = query({
    start: 0,
    count: 100,
    sort: 'modifiedTime DESC',
    query: `modifiedtime >= date('${yesterday}')`,
    contentTypes: [`${app.name}:statistics`, `${app.name}:article`, `${app.name}:page`]
  })

  const urls: string[] = changedContent.hits.map((content) => {
    return baseUrl + content._path.slice(4) // trim off leading '/ssb' from path
  })

  const template: ResourceKey = resolve('./solrUpdater.html') as ResourceKey
  const model: urlModel = {
    urls: urls
  }

  return {
    body: render(template, model),
    contentType: 'text/html'
  }
}

interface urlModel {
    urls: Array<string>
}
