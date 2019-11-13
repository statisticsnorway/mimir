import { getSiteConfig } from '/lib/xp/portal'
import { getChildren } from '/lib/xp/content'

/**
 * @return {array} Returns everything in the "code" node from ssb api
 */
export const list = () => getMunicipalsFromContent()

/**
 *
 * @param {string} queryString
 * @return {array} a set of municipals containing the querystring in municiaplity code or name
 */
export const query = (queryString) => getMunicipalsFromContent()
    .filter( (municipal) => RegExp(queryString).test(`${municipal.code} ${municipal.name.toLowerCase()}` ))


function getMunicipalsFromContent() {
    const key = getSiteConfig().municipalDataContentId
    const content = key ? getChildren({key}).hits[0] : {data: {}}
    return content.data.json ? JSON.parse(content.data.json).codes : []
}

/**
 *
 * @param {string} municipalName required
 * @param {string} countyName optional, if set it will be added to the path
 * @return {string} create valid municipal path
 */
export const createPath = (municipalName, countyName = undefined) => {
    const path = countyName !== undefined ? `/${municipalName}-${countyName}` : `/${municipalName}`
    return path.replace(/ /g, '-')
        .replace(/-+/g, '-')
        .toLowerCase()
        .replace(/å/g, 'a')
        .replace(/æ/g, 'ae')
        .replace(/á/g, 'a')
        .replace(/ø/g, 'o')
}
