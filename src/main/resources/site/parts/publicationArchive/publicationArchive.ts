import { Request } from 'enonic-types/controller'
import { Component } from 'enonic-types/portal'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Content } from 'enonic-types/content'
import { PublicationArchivePartConfig } from './publicationArchive-part-config'
import { StatisticInListing } from '../../../lib/ssb/dashboard/statreg/types'
import { getAllStatisticsFromRepo } from '../../../lib/ssb/statreg/statistics'
import { PublicationItem, PublicationResult } from '../../../lib/ssb/utils/articleUtils'
import { Release } from '../../../lib/ssb/utils/variantUtils'
import { fromPartCache } from '../../../lib/ssb/cache/partCache'
import { SubjectItem } from '../../../lib/ssb/utils/subjectUtils'

const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  getContent, serviceUrl, getComponent
} = __non_webpack_require__('/lib/xp/portal')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getPublications
} = __non_webpack_require__( '/lib/ssb/utils/articleUtils')
const {
  preparePublication,
  getPreviousReleases
} = __non_webpack_require__( '/lib/ssb/utils/variantUtils')
const {
  getMainSubjects
} = __non_webpack_require__( '/lib/ssb/utils/subjectUtils')

exports.get = (req: Request): React4xpResponse => {
  return renderPart(req)
}

exports.preview = (req: Request): React4xpResponse => renderPart(req)

function renderPart(req: Request): React4xpResponse {
  const content: Content = getContent()
  const part: Component<PublicationArchivePartConfig> = getComponent()
  const phrases: {[key: string]: string} = getPhrases(content)
  const language: string = content.language ? content.language : 'nb'
  const publicationArchiveServiceUrl: string = serviceUrl({
    service: 'publicationArchive'
  })
  const mainSubjects: Array<SubjectItem> = getMainSubjects(req, language)
  const start: number = 0
  const count: number = 10

  const releasesPreppedNew: Array<PublicationItem> = fromPartCache(req, `${content._id}-publicationArchive`, () => {
    const statistics: Array<StatisticInListing> = getAllStatisticsFromRepo()
    const previousReleases: Array<Release> = getPreviousReleases(statistics)
    const statisticsReleases: Array<PublicationItem> = []

    previousReleases.map((release: Release) => {
      const preppedRelease: PublicationItem | null = preparePublication(mainSubjects, release, language)
      if (preppedRelease) {
        statisticsReleases.push(preppedRelease)
      }
    })
    return statisticsReleases
  })

  const props: PartProperties = {
    title: content.displayName,
    ingress: part.config.ingress || '',
    buttonTitle: phrases['button.showMore'],
    showingPhrase: phrases['publicationArchive.showing'],
    language,
    publicationArchiveServiceUrl,
    articles: getPublications(start, count, language),
    statisticsReleases: releasesPreppedNew,
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

  return React4xp.render('site/parts/publicationArchive/publicationArchive', props, req)
}

interface PartProperties {
  title: string;
  ingress: string;
  buttonTitle: string;
  showingPhrase: string;
  language: string;
  publicationArchiveServiceUrl: string;
  articles: PublicationResult;
  statisticsReleases: Array<PublicationItem>;
  articleTypePhrases: {
    [key: string]: string;
  };
}
