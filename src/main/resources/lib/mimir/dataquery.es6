import { query } from '/lib/xp/content';


export const get = (key) => {
    const queryString = `_id = '${key.key}'`;
    const content = query({
        contentTypes: [`${app.name}:dataquery`],
        query: queryString
    });
    return content.count === 1 ? content.hits[0] : { error: `Could not find dataquery with id ${key.key}` }
}
