import { Request } from 'enonic-types/controller'
import { Component } from 'enonic-types/portal'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Content } from 'enonic-types/content'
import { PublicationArchivePartConfig } from './publicationArchive-part-config'
import { StatisticInListing } from '../../../lib/ssb/dashboard/statreg/types'
import { PreparedStatistics,prepareRelease} from '../../../lib/ssb/utils/variantUtils'
import { getAllStatisticsFromRepo } from '../../../lib/ssb/statreg/statistics'
import { filterOnPreviousReleases } from '../releasedStatistics/releasedStatistics'
import { PublicationItem } from '../../../services/publicationArchive/publicationArchive'
import { hasPath } from 'ramda'

const {
  moment
} = __non_webpack_require__('/lib/vendor/moment')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  getContent, serviceUrl, getComponent
} = __non_webpack_require__('/lib/xp/portal')
const {
  query
} = __non_webpack_require__('/lib/xp/content')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

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

  // iterate and format month names
  const numberOfReleases: number = 1 // TODO: get dynamically, use 
  // Get statistics
  const releases: Array<StatisticInListing> = getAllStatisticsFromRepo()
  // All statistics published today, and fill up with previous releases.
  const releasesFiltered: Array<StatisticInListing> = filterOnPreviousReleases(releases, numberOfReleases)
  // Choose the right variant and prepare the date in a way it works with the groupBy function
  const releasesPrepped: Array<PreparedStatistics | null> = releasesFiltered.map((release: StatisticInListing) => prepareRelease(release, language))

  const props: PartProperties = {
    title: content.displayName,
    ingress: part.config.ingress || '',
    buttonTitle: phrases['button.showMore'],
    showingPhrase: phrases['publicationArchive.showing'],
    language,
    publicationArchiveServiceUrl,
    prepareStatisticsReleases: prepareStatisticsReleases(releasesPrepped as Array<PreparedStatistics>, language),
    articleTypePhrases: {
      default: phrases['articleType.default'],
      report: phrases['articleType.report'],
      note: phrases['articleType.note'],
      analysis: phrases['articleType.analysis'],
      economicTrends: phrases['articleType.economicTrends'],
      discussionPaper: phrases['articleType.discussionPaper']
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
        preface: `${period.charAt(0).toUpperCase() + period.slice(1)}
        ${statistic.seoDescription}`,
        url: statistic.statisticsPageUrl,
        publishDate: variantDate,
        publishDateHuman: moment(variantDate).locale(language).format('Do MMMM YYYY'),
        contentType: `${app.name}:statistics`,
        articleType: statistic.type,
        mainSubject: statistic.mainSubject
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
  prepareStatisticsReleases: Array<PublicationItem> | [];
  articleTypePhrases: {
    [key: string]: string;
  };
}
