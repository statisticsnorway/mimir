import { Request } from 'enonic-types/controller'
import { Component } from 'enonic-types/portal'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Content } from 'enonic-types/content'
import { PublicationArchivePartConfig } from './publicationArchive-part-config'
import { StatisticInListing } from '../../../lib/ssb/dashboard/statreg/types'
import { PreparedStatistics } from '../../../lib/ssb/utils/variantUtils'
import { getAllStatisticsFromRepo } from '../../../lib/ssb/statreg/statistics'
import { filterOnPreviousReleases } from '../releasedStatistics/releasedStatistics'
import { PublicationItem } from '../../../services/publicationArchive/publicationArchive'
import { fromPartCache } from '../../../lib/ssb/cache/partCache'

const {
  moment
} = __non_webpack_require__('/lib/vendor/moment')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  getContent, serviceUrl, getComponent
} = __non_webpack_require__('/lib/xp/portal')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  prepareStatisticRelease
} = __non_webpack_require__('/lib/ssb/utils/variantUtils')

exports.get = (req: Request): React4xpResponse => {
  return renderPart(req)
}

exports.preview = (req: Request): React4xpResponse => renderPart(req)

function renderPart(req: Request): React4xpResponse {
  const content: Content = getContent()
  const part: Component<PublicationArchivePartConfig> = getComponent()
  const phrases: {[key: string]: string} = getPhrases(content)
  const language: string = content.language ? content.language : 'nb'
  const isNotInEditMode: boolean = req.mode !== 'edit'
  const publicationArchiveServiceUrl: string = serviceUrl({
    service: 'publicationArchive'
  })

  const releasesPrepped: Array<PreparedStatistics | null> = fromPartCache(req, `${content._id}-publicationArchive`, () => {
    const releases: Array<StatisticInListing> = getAllStatisticsFromRepo()
    const releasesFiltered: Array<StatisticInListing> = filterOnPreviousReleases(releases, releases.length).filter((r) => r.status === 'A')
    return releasesFiltered.map((release: StatisticInListing) => prepareStatisticRelease(release, language))
  })

  const props: PartProperties = {
    title: content.displayName,
    ingress: part.config.ingress || '',
    buttonTitle: phrases['button.showMore'],
    showingPhrase: phrases['publicationArchive.showing'],
    language,
    publicationArchiveServiceUrl,
    statisticsReleases: prepareStatisticsReleases(releasesPrepped as Array<PreparedStatistics>, language),
    articleTypePhrases: {
      default: phrases['articleType.default'],
      report: phrases['articleType.report'],
      note: phrases['articleType.note'],
      analysis: phrases['articleType.analysis'],
      economicTrends: phrases['articleType.economicTrends'],
      discussionPaper: phrases['articleType.discussionPaper'],
      statistics: phrases['articleType.statistics']
    }
  }

  return React4xp.render('site/parts/publicationArchive/publicationArchive', props, req, {
    clientRender: isNotInEditMode
  })
}

function prepareStatisticsReleases(statistics: Array<PreparedStatistics>, language: string): Array<PublicationItem> | [] {
  if (statistics.length) {
    return statistics.map((statistic) => {
      const {
        period, year, monthNumber, day
      } = statistic.variant
      const variantDate: string = new Date(year, monthNumber, day).toISOString()

      return {
        title: statistic.name,
        period: period.charAt(0).toUpperCase() + period.slice(1),
        preface: statistic.aboutTheStatisticsDescription,
        url: statistic.statisticsPageUrl,
        publishDate: variantDate,
        publishDateHuman: moment(variantDate).locale(language).format('Do MMMM YYYY'),
        contentType: `${app.name}:statistics`,
        articleType: 'statistics',
        mainSubject: statistic.mainSubject,
        appName: app.name
      }
    }) as Array<PublicationItem>
  }
  return []
}

interface PartProperties {
  title: string;
  ingress: string;
  buttonTitle: string;
  showingPhrase: string;
  language: string;
  publicationArchiveServiceUrl: string;
  statisticsReleases: Array<PublicationItem> | [];
  articleTypePhrases: {
    [key: string]: string;
  };
}
