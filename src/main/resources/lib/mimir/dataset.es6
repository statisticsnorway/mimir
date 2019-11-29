import { query } from '/lib/xp/content'

export const get = (key) => {
    const content = query({
        contentTypes: [`${app.name}:dataset`],
        query: `_id = '${key.key}'`
    });
    return content.count === 1 ? content.hits[0] : { error: `Could not find dataset with id ${key.key}` }
}

/**
 * Get the last created dataset with dataQuery content id
 * @param {string} dataQueryContentId
 * @return {object}
 */
export const getDataSetWithDataQueryId = (dataQueryContentId) => query({
        count: 1,
        contentTypes: [`${app.name}:dataset`],
        sort: 'createdTime DESC',
        query: `data.dataquery = '${dataQueryContentId}'`
    })
