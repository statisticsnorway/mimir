import { query } from '/lib/xp/content'

const contentTypeName = `${app.name}:municipalityAlert`

export const get = (key: { key: string }) => {
  const content = query({
    contentTypes: [contentTypeName],
    query: `_id = '${key.key}'`,
  })
  return content.count === 1
    ? content.hits[0]
    : {
        error: `Could not find ${contentTypeName} with id ${key.key}`,
      }
}

export const list = (municipalCode: string, municipalPageType: string) => {
  const now = new Date()
  return query({
    query: `(data.selectAllMunicipals = 'true' OR data.municipalCodes IN ('${municipalCode}')) 
    AND (data.municipalPageType IN ('${municipalPageType}') OR data.municipalPageType = 'showOnAll') 
    AND publish.from LIKE '*' 
    AND (publish.to NOT LIKE '*' OR publish.to > '${now.toISOString()}')`,
    contentTypes: [contentTypeName],
  })
}
