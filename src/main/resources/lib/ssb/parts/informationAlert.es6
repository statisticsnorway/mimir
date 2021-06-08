const {
  query
} = __non_webpack_require__('/lib/xp/content')

const contentTypeName = `${app.name}:informationAlert`

export const get = (key) => {
  const content = query({
    contentTypes: [contentTypeName],
    query: `_id = '${key.key}'`
  })
  return content.count === 1 ? content.hits[0] : {
    error: `Could not find ${contentTypeName} with id ${key.key}`
  }
}

export const list = ( pageTypeId ) => {
  const now = new Date()

  return query({
    query: `((data.informationAlertVariations.statistics.selectAllStatistics = 'true' 
    OR data.informationAlertVariations.statistics.statisticsIds IN ('${pageTypeId}'))
    OR (data.informationAlertVariations.pages.pageIds IN ('${pageTypeId}'))
    OR (data.informationAlertVariations.articles.articleIds IN ('${pageTypeId}')))
    AND (publish.from LIKE '*' AND publish.from < '${now.toISOString()}')
    AND (publish.to NOT LIKE '*' OR publish.to > '${now.toISOString()}')`,
    contentType: contentTypeName
  })
}
