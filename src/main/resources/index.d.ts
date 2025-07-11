import { PartComponent as _PartComponent, LayoutComponent as _LayoutComponent } from '@enonic-types/core'

declare global {
  namespace XP {
    namespace PartComponent {
      export type Accordion = _PartComponent<'mimir:accordion'>
      export type ActiveStatistics = _PartComponent<'mimir:activeStatistics'>
      export type Article = _PartComponent<'mimir:article'>
      export type ArticleArchive = _PartComponent<'mimir:articleArchive'>
      export type ArticleList = _PartComponent<'mimir:articleList'>
      export type AttachmentTablesFigures = _PartComponent<'mimir:attachmentTablesFigures'>
      export type Banner = _PartComponent<'mimir:banner'>
      export type BkibolCalculator = _PartComponent<'mimir:bkibolCalculator'>
      export type BpiCalculator = _PartComponent<'mimir:bpiCalculator'>
      export type CategoryLinks = _PartComponent<'mimir:categoryLinks'>
      export type CombinedGraph = _PartComponent<'mimir:combinedGraph'>
      export type Contact = _PartComponent<'mimir:contact'>
      export type ContactForm = _PartComponent<'mimir:contactForm'>
      export type Divider = _PartComponent<'mimir:divider'>
      export type DownloadLink = _PartComponent<'mimir:downloadLink'>
      export type Employee = _PartComponent<'mimir:employee'>
      export type EmployeeList = _PartComponent<'mimir:employeeList'>
      export type EndedStatistics = _PartComponent<'mimir:endedStatistics'>
      export type EntryLinks = _PartComponent<'mimir:entryLinks'>
      export type ExternalCard = _PartComponent<'mimir:externalCard'>
      export type FactBox = _PartComponent<'mimir:factBox'>
      export type FrontPageBanner = _PartComponent<'mimir:frontPageBanner'>
      export type FrontpageKeyfigures = _PartComponent<'mimir:frontpageKeyfigures'>
      export type Highchart = _PartComponent<'mimir:highchart'>
      export type HighchartExpert = _PartComponent<'mimir:highchartExpert'>
      export type Highmap = _PartComponent<'mimir:highmap'>
      export type HusleieCalculator = _PartComponent<'mimir:husleieCalculator'>
      export type InfoGraphics = _PartComponent<'mimir:infoGraphics'>
      export type KeyFigure = _PartComponent<'mimir:keyFigure'>
      export type KpiCalculator = _PartComponent<'mimir:kpiCalculator'>
      export type Links = _PartComponent<'mimir:links'>
      export type LocalSearch = _PartComponent<'mimir:localSearch'>
      export type MailChimpForm = _PartComponent<'mimir:mailChimpForm'>
      export type Map = _PartComponent<'mimir:map'>
      export type Maths = _PartComponent<'mimir:maths'>
      export type MenuBox = _PartComponent<'mimir:menuBox'>
      export type MenuDropdown = _PartComponent<'mimir:menuDropdown'>
      export type NameSearch = _PartComponent<'mimir:nameSearch'>
      export type OmStatistikken = _PartComponent<'mimir:omStatistikken'>
      export type PictureCardLinks = _PartComponent<'mimir:pictureCardLinks'>
      export type PifCalculator = _PartComponent<'mimir:pifCalculator'>
      export type ProfiledBox = _PartComponent<'mimir:profiledBox'>
      export type ProfiledLinkIcon = _PartComponent<'mimir:profiledLinkIcon'>
      export type Project = _PartComponent<'mimir:project'>
      export type PubArchiveCalendarLinks = _PartComponent<'mimir:pubArchiveCalendarLinks'>
      export type PublicationArchive = _PartComponent<'mimir:publicationArchive'>
      export type RelatedArticles = _PartComponent<'mimir:relatedArticles'>
      export type RelatedExternalLinks = _PartComponent<'mimir:relatedExternalLinks'>
      export type RelatedFactPage = _PartComponent<'mimir:relatedFactPage'>
      export type RelatedKostra = _PartComponent<'mimir:relatedKostra'>
      export type RelatedStatistics = _PartComponent<'mimir:relatedStatistics'>
      export type ReleasedStatistics = _PartComponent<'mimir:releasedStatistics'>
      export type RichText = _PartComponent<'mimir:richText'>
      export type SearchResult = _PartComponent<'mimir:searchResult'>
      export type SimpleStatbank = _PartComponent<'mimir:simpleStatbank'>
      export type StandardCardsList = _PartComponent<'mimir:standardCardsList'>
      export type StatbankBox = _PartComponent<'mimir:statbankBox'>
      export type StatbankFrame = _PartComponent<'mimir:statbankFrame'>
      export type StatbankLinkList = _PartComponent<'mimir:statbankLinkList'>
      export type StatbankSubjectTree = _PartComponent<'mimir:statbankSubjectTree'>
      export type StaticVisualization = _PartComponent<'mimir:staticVisualization'>
      export type Statistics = _PartComponent<'mimir:statistics'>
      export type StatisticContact = _PartComponent<'mimir:statisticContact'>
      export type StatisticHeader = _PartComponent<'mimir:statisticHeader'>
      export type StatisticFigures = _PartComponent<'mimir:statisticFigures'>
      export type StatisticDescription = _PartComponent<'mimir:statisticDescription'>
      export type SubjectArticleList = _PartComponent<'mimir:subjectArticleList'>
      export type Table = _PartComponent<'mimir:table'>
      export type Timeline = _PartComponent<'mimir:timeline'>
      export type UpcomingReleases = _PartComponent<'mimir:upcomingReleases'>
      export type Variables = _PartComponent<'mimir:variables'>
      export type VideoEmbed = _PartComponent<'mimir:videoEmbed'>
      export type WebcruiterAdvertisementList = _PartComponent<'mimir:webcruiterAdvertisementList'>
    }

    namespace LayoutComponent {
      export type Triple = _LayoutComponent<'mimir:triple', XpLayoutMap['mimir:triple']>
      export type Topic = _LayoutComponent<'mimir:topic', XpLayoutMap['mimir:topic']>
      export type Columns = _LayoutComponent<'mimir:columns', XpLayoutMap['mimir:columns']>
    }
  }
}

declare global {
  interface Window {
    dataLayer: Array<{
      event: string
      consent?: 'all' | 'necessary' | 'unidentified'
      ad_storage?: 'granted' | 'denied'
      analytics_storage?: 'granted' | 'denied'
      ad_personalization?: 'granted' | 'denied'
      functionality_storage?: 'granted' | 'denied'
      security_storage?: 'granted' | 'denied'
      [key: string]: unknown
    }>
    gtag?: (...args: [string, string, Record<string, string>]) => void
  }
}
