import { query } from '/lib/xp/content'

const contentTypeName = `${app.name}:menuDropdown`

export const getWithPath = (path: string) =>
  query({
    contentTypes: [contentTypeName],
    count: 1,
    query: `_path LIKE '${path}/*'`,
  })
