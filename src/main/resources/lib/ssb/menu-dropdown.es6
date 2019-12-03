import { query } from '/lib/xp/content'
const contentTypeName = `${app.name}:menu-dropdown`

export const getWithPath = (path) => query({
  contentTypes: [contentTypeName],
  count: 1,
  query: `_path LIKE '${path}/*'`
})
