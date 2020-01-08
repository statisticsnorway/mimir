const { getSiteConfig } = __non_webpack_require__( '/lib/xp/portal')
const { getChildren } = __non_webpack_require__( '/lib/xp/content')

/**
 *
 * @return {array} Returns everything in the "code" node from ssb api
 */
export const list = () => getCountiesFromContent()


function getCountiesFromContent () {
  const key = getSiteConfig().countyDataContentId
  const children = getChildren({ key }).hits
  if (children.length > 0) {
    const content = key ? children[0] : { data: {} }
    return content.data.json ? JSON.parse(content.data.json).codes : []
  }
  return []
}
