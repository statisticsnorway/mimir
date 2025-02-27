import { query, Content } from '/lib/xp/content'
import { pageUrl } from '/lib/xp/portal'
import { getAllStatisticsFromRepo } from '/lib/ssb/statreg/statistics'
import { StatisticInListing } from '/lib/ssb/dashboard/statreg/types'
import { Statistics } from '/site/content-types'

type Lang = 'no' | 'en' | undefined

function get(req: XP.Request): XP.Response {
  const { lang } = req.params as { lang: Lang }

  const statistics = getAllStatisticsFromRepo()

  let body = ''
  if (lang === 'no' || !lang) {
    body += '#\n# Rewrite map for norske kortnavn pa ssb.no\n#\n'
    body += fetchAndMap('no', statistics)
  }

  if (lang === 'en' || !lang) {
    body += '\n#\n# Rewrite map for engelske kortnavn pa ssb.no\n#\n'
    body += fetchAndMap('en', statistics)
  }

  return {
    body,
    contentType: 'text/plain',
  }
}

function fetchAndMap(lang: Lang, statistics: StatisticInListing[]) {
  let queryString = "data.statistic LIKE '*'"
  if (lang) {
    const languages = lang === 'en' ? ['en'] : ['no', 'nb', 'nn']
    queryString += ` AND language IN ('${languages.join("', '")}')`
  }

  const statisticsContent = query({
    contentTypes: [`${app.name}:statistics`],
    count: 9999,
    sort: 'language DESC',
    query: queryString,
  }).hits as unknown as Content<Statistics>[]

  const shortNameMapping = statisticsContent
    .map((content) => {
      const { statistic } = content.data
      const statisticNode = statistics.find((_statisticNode) => _statisticNode.id.toString() === statistic)

      if (!statisticNode) {
        return null
      }

      return `${statisticNode.shortName} ${pageUrl({ path: content._path })}`
    })
    .filter(Boolean)
    .join('\n')

  return shortNameMapping
}

exports.get = get
