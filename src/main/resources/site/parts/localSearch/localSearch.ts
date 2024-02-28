import { get as getContentByKey, query, type Content } from '/lib/xp/content'
import { getComponent, pageUrl } from '/lib/xp/portal'
import { render } from '/lib/enonic/react4xp'

import { renderError } from '/lib/ssb/error/error'
import { LocalSearchProps, SearchFolderItem, SearchItem } from '/lib/types/partTypes/localSearch'

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

function renderPart(req: XP.Request) {
  const config = getComponent<XP.PartComponent.LocalSearch>()?.config
  if (!config) throw Error('No part found')

  const searchFolderContent: Content<object> | null = config.searchFolder
    ? getContentByKey({
        key: config.searchFolder,
      })
    : null

  const filteredItems: Array<SearchItem> = searchFolderContent
    ? query({
        start: 0,
        count: 1000,
        sort: 'displayName ASC',
        query: `_parentPath LIKE "/content${searchFolderContent._path}"`,
        contentTypes: [`${app.name}:statistics`, `${app.name}:article`, `${app.name}:page`],
      }).hits.map((item: SearchFolderItem) => {
        return {
          title: item.data.serialNumber ? item.displayName + ' (' + item.data.serialNumber + ')' : item.displayName,
          id: item._id,
          url: pageUrl({
            id: item._id,
          }),
        }
      })
    : []

  const props: LocalSearchProps = {
    title: config.title,
    placeholder: config.searchPlaceholder,
    items: filteredItems,
  }

  return render('site/parts/localSearch/localSearch', props, req)
}
