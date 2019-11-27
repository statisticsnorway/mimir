import { getSiteConfig } from'/lib/xp/portal'
import { getChildren } from'/lib/xp/content'

/**
 *
 * @return {array} Returns everything in the "code" node from ssb api
 */
export const list = () => getCountiesFromContent()


function getCountiesFromContent() {
    const key = getSiteConfig().countyDataContentId
    const content = key ? getChildren({key}).hits[0] : {data: {}}
    return content.data.json ? JSON.parse(content.data.json).codes : []
}
