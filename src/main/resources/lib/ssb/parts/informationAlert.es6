const {
  query
} = __non_webpack_require__('/lib/xp/content')
const {
  getContent
} = __non_webpack_require__('/lib/xp/portal')

const contentTypeName = `${app.name}:informationAlert`
const oldContentTypeName = `${app.name}:statisticAlert` // remove when this content type is not in use anymore

export const get = (key) => {
  const content = query({
    contentTypes: [contentTypeName, oldContentTypeName],
    query: `_id = '${key.key}'`
  })
  return content.count === 1 ? content.hits[0] : {
    error: `Could not find ${contentTypeName} or ${oldContentTypeName} with id ${key.key}`
  }
}

export const list = ( pageType, pageTypeId, statbankWeb ) => {
  const now = new Date()
  const language = getContent().language === 'en' ? 'en' : 'nb' // Alerts are the same for bokmål and nynorsk
  let queryString = `((data.informationAlertVariations.pages.pageIds IN ('${pageTypeId}') 
  OR data.informationAlertVariations.articles.articleIds IN ('${pageTypeId}'))  
  OR (data.selectAllStatistics = 'true' OR data.statisticIds IN ('${pageTypeId}')))`

  /* todo: when the content type 'statisticAlert' is removed, this line in both queries under can
  *  safeley be removed too: 'OR (data.selectAllStatistics = 'true' OR data.statisticIds IN ('${pageTypeId}'))'
  */
  if (pageType === `${app.name}:statistics`) {
    queryString = `(
        (data.informationAlertVariations.statistics.selectAllStatistics = 'true' 
        OR data.informationAlertVariations.statistics.statisticsIds IN ('${pageTypeId}')) 
        OR (data.selectAllStatistics = 'true' OR data.statisticIds IN ('${pageTypeId}')) 
      )`
  }

  if (statbankWeb) {
    queryString = `(data.informationAlertVariations.statbank.selectAllStatbankPages = 'true')`
  }

  return query({
    query: `${queryString} 
    AND (language = '${language}')
    AND (publish.from LIKE '*' AND publish.from < '${now.toISOString()}')
    AND (publish.to NOT LIKE '*' OR publish.to > '${now.toISOString()}')`,
    contentTypes: [contentTypeName, oldContentTypeName]
  })
}
