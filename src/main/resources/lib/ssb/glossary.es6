import { query } from '/lib/xp/content'

const contentTypeName = `${app.name}:glossary`;

export const get = (key) => {
  const queryString = `_id = '${key.key}'`;
  const content = query({
    contentTypes: [contentTypeName],
    query: queryString
  });
  return content.count === 1 ? {...content.hits[0], status: 200} :
    {status: 404, message: `Could not find ${contentTypeName} with id ${key.key}`}
}

export const parseGlossaryContent = (key) => {
  const glossary = get(key);
  return {
    _id: glossary._id,
    displayName: glossary.displayName,
    ingress: glossary.data.ingress
  }
}

