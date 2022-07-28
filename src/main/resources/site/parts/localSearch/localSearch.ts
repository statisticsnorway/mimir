import { get, query, Content } from '/lib/xp/content'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { LocalSearchPartConfig } from './localSearch-part-config'

const {
  getComponent, pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp') as React4xp

exports.get = function(req:XP.Request):XP.Response | React4xpResponse {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

exports.preview = (req: XP.Request): React4xpResponse => {
  return renderPart(req)
}

function renderPart(req: XP.Request): React4xpResponse {
  const config: LocalSearchPartConfig = getComponent().config
  const searchFolderContent: Content<object> | null = config.searchFolder ? get({
    key: config.searchFolder
  }) : null

  const filteredItems: Array<SearchItem> = searchFolderContent ? query({
    start: 0,
    count: 1000,
    sort: 'displayName ASC',
    query: `_parentPath LIKE "/content${searchFolderContent._path}"`,
    contentTypes: [
      `${app.name}:statistics`,
      `${app.name}:article`,
      `${app.name}:page`
    ]
  }).hits.map((item: SearchFolderItem) => {
    return {
      title: item.data.serialNumber ? item.displayName + ' (' + item.data.serialNumber + ')' : item.displayName,
      id: item._id,
      url: pageUrl({
        id: item._id
      })
    }
  }) : []

  const props: PartProperties = {
    title: config.title,
    placeholder: config.searchPlaceholder,
    items: filteredItems
  }

  return React4xp.render('site/parts/localSearch/localSearch', props, req)
}

interface PartProperties {
  title: string;
  placeholder: string;
  items: object;
}

interface SearchItem {
  title: string;
  id: string;
  url: string;
}

interface SearchFolderItem {
  '_id': string;
  displayName: string;
  data: {
    serialNumber?: string;
  }
}

