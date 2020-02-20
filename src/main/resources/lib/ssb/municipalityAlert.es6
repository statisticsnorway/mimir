const {
  query
} = __non_webpack_require__( '/lib/xp/content')

const contentTypeName = `${app.name}:municipalityAlert`

export const get = (key) => {
  const content = query({
    contentTypes: [contentTypeName],
    query: `_id = '${key.key}'`
  })
  return content.count === 1 ? content.hits[0] : {
    error: `Could not find ${contentTypeName} with id ${key.key}`
  }
}

export const list = ( municipalCode ) => {
  const now = new Date()
  return query({
    query: `data.municipalCodes IN ('${municipalCode}') AND publish.from LIKE '*' AND (publish.to NOT LIKE '*' OR publish.to > '${now.toISOString()}')`,
    contentType: contentTypeName
  })
}
