import { query } from '/lib/xp/content'
import { getContent } from '/lib/xp/portal'


export const getSiteNotifications = () => {
    return query({
        contentTypes: [`${app.name}:notification`],
        query: `language = '${getContent().language}'`,
        filters: {
            notExists: {
                field: 'data.municipalCodes'
            }
        }
    })
}

export const getMunicipalNotifications = (municipalCode) => query({
    query: `data.municipalCodes IN ('${municipalCode}')`,
    contentType: `${app.name}:notification`
})
