import { query } from '/lib/xp/content'
import { NOT_FOUND } from './error';

const contentTypeName = `${app.name}:key-figure`

export const get = (key) => {
  const content = query({
    contentTypes: [contentTypeName],
    query: `_id = '${key.key}'`
  });
  return content.count === 1 ? {...content.hits[0], status: 200} :
    {status: 404, message: `Could not find ${contentTypeName} with id ${key.key}`}
}
