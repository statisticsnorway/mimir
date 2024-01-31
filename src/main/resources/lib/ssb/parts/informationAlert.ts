import { query } from '/lib/xp/content'
import { getContent } from '/lib/xp/portal'

const contentTypeName = `${app.name}:informationAlert`
const oldContentTypeName = `${app.name}:statisticAlert` // remove when this content type is not in use anymore

export const get = (key: { key: string }) => {
  const content = query({
    contentTypes: [contentTypeName, oldContentTypeName],
    query: `_id = '${key.key}'`,
  })
  return content.count === 1
    ? content.hits[0]
    : {
        error: `Could not find ${contentTypeName} or ${oldContentTypeName} with id ${key.key}`,
      }
}

export const list = (pageType: string, pageTypeId: string, statbankWeb: boolean) => {
  const now = new Date()
  let queryString = `(data.informationAlertVariations.pages.pageIds IN ('${pageTypeId}') 
  OR data.informationAlertVariations.articles.articleIds IN ('${pageTypeId}'))`

  if (pageType === `${app.name}:statistics`) {
    queryString = `(data.informationAlertVariations.statistics.selectAllStatistics = 'true' 
     OR data.informationAlertVariations.statistics.statisticsIds IN ('${pageTypeId}'))`
  }

  if (statbankWeb) {
    queryString = `(data.informationAlertVariations.statbank.selectAllStatbankPages = 'true')`
  }

  const language = getContent()?.language === 'en' ? 'en' : 'nb' // Alerts are the same for bokmål and nynorsk
  const languageQuery = language !== 'en' ? 'AND language != "en"' : 'AND language = "en"'
  return query({
    query: `${queryString} 
    ${languageQuery} 
    AND (publish.from LIKE '*' AND publish.from < '${now.toISOString()}')
    AND (publish.to NOT LIKE '*' OR publish.to > '${now.toISOString()}')`,
    contentTypes: [contentTypeName, oldContentTypeName],
  })
}
