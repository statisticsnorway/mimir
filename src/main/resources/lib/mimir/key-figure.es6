import { query } from '/lib/xp/content'


export const get = (key) => {
    const content = query({
        contentTypes: [`${app.name}:key-figure`],
        query: `_id = '${key.key}'`
    });
    return content.count === 1 ? content.hits[0] : { error: `Could not find key-figure with id ${key.key}` }
}
