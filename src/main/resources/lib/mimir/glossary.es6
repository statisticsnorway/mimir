import { query } from '/lib/xp/content'


export const get = (key) => {
    const queryString = `_id = '${key.key}'`;
    const content = query({
        contentTypes: [`${app.name}:glossary`],
        query: queryString
    });
    return content.count === 1 ? content.hits[0] : { error: `Could not find glossary with id ${key.key}` }
}

export const parseGlossaryContent = (key) => {
    const glossary = get(key);
    return {
        _id: glossary._id,
        displayName: glossary.displayName,
        ingress: glossary.data.ingress
    }
}

