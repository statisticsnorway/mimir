import { query, Content, Page } from '/lib/xp/content'
import { ResourceKey, render } from '/lib/thymeleaf'
import { ReleaseDatesVariant, StatisticInListing, VariantInListing } from '../../../lib/ssb/dashboard/statreg/types'
import { MunicipalityWithCounty } from '../../../lib/ssb/dataset/klass/municipalities'
import { FooterContent } from '../../../lib/ssb/parts/footer'
import { AlertType, InformationAlertOptions, MunicipalityOptions } from '../../../lib/ssb/utils/alertUtils'
import { Breadcrumbs } from '../../../lib/ssb/utils/breadcrumbsUtils'
import { SubjectItem } from '../../../lib/ssb/utils/subjectUtils'
import { Language } from '../../../lib/types/language'
import { React4xp, React4xpObject, React4xpPageContributionOptions } from '../../../lib/types/react4xp'
import { SEO } from '../../../services/news/news'
import { Statistics } from '../../content-types/statistics/statistics'
import { SiteConfig } from '../../site-config'
import { DefaultPageConfig } from './default-page-config'
import { HeaderContent } from '../../../lib/ssb/parts/header'

const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  getContent,
  processHtml,
  assetUrl,
  getSiteConfig
} = __non_webpack_require__('/lib/xp/portal')
const {
  getLanguage
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  localize
} = __non_webpack_require__('/lib/xp/i18n')
const {
  alertsForContext
} = __non_webpack_require__('/lib/ssb/utils/alertUtils')
const {
  getBreadcrumbs
} = __non_webpack_require__('/lib/ssb/utils/breadcrumbsUtils')
const {
  getMainSubjects, getSubSubjects, getMainSubjectBySubSubject
} = __non_webpack_require__( '/lib/ssb/utils/subjectUtils')
const {
  getReleaseDatesByVariants, getStatisticByIdFromRepo, getStatisticByShortNameFromRepo
} = __non_webpack_require__('/lib/ssb/statreg/statistics')
const {
  getMunicipality
} = __non_webpack_require__('/lib/ssb/dataset/klass/municipalities')
const {
  getHeaderContent
} = __non_webpack_require__('/lib/ssb/parts/header')
const {
  getFooterContent
} = __non_webpack_require__('/lib/ssb/parts/footer')
const {
  fromMenuCache
} = __non_webpack_require__('/lib/ssb/cache/cache')

const {
  isEnabled
} = __non_webpack_require__('/lib/featureToggle')

const partsWithPreview: Array<string> = [ // Parts that has preview
  `${app.name}:map`,
  `${app.name}:button`,
  `${app.name}:menuBox`,
  `${app.name}:accordion`,
  `${app.name}:highchart`,
  `${app.name}:highmap`,
  `${app.name}:keyFigure`,
  `${app.name}:menuDropdown`,
  `${app.name}:statistikkbanken`,
  `${app.name}:dataquery`,
  `${app.name}:factBox`,
  `${app.name}:contentList`,
  `${app.name}:omStatistikken`,
  `${app.name}:table`,
  `${app.name}:staticVisualization`
]

const previewOverride: object = {
  'contentList': 'relatedFactPage'
}

export const GA_TRACKING_ID: string | null = app.config && app.config.GA_TRACKING_ID ? app.config.GA_TRACKING_ID : null

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view: ResourceKey = resolve('default.html')

exports.get = function(req: XP.Request): XP.Response {
  const page: DefaultPage = getContent()
  const pageConfig: DefaultPageConfig = page.page.config

  const ingress: string | undefined = page.data.ingress ? processHtml({
    value: page.data.ingress.replace(/&nbsp;/g, ' ')
  }) : undefined
  const showIngress: string | boolean | undefined = ingress && page.type === 'mimir:page'

  // Create preview if available
  let preview: XP.Response | undefined
  if (partsWithPreview.includes(page.type)) {
    let name: string = page.type.replace(/^.*:/, '')
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    if (previewOverride[name]) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
      name = previewOverride[name]
    }
    const controller: Controller = __non_webpack_require__(`../../parts/${name}/${name}`)
    if (controller.preview) {
      preview = controller.preview(req, page._id)
    }
  }

  const isFragment: boolean = page.type === 'portal:fragment'
  const regions: RegionsContent = prepareRegions(isFragment, page)
  let config: DefaultPageConfig | undefined
  if (!isFragment && pageConfig) {
    config = pageConfig
  } else if (isFragment && page.fragment && page.fragment.config) {
    config = page.fragment.config
  }

  const bodyClasses: Array<string> = []
  if (config && config.bkg_color === 'grey') {
    bodyClasses.push('bkg-grey')
  }

  const stylesUrl: string = assetUrl({
    path: 'styles/bundle.css'
  })

  const jsLibsUrl: string = assetUrl({
    path: 'js/bundle.js'
  })

  const ieUrl: string = assetUrl({
    path: '/js/ie.js'
  })

  let pageContributions: React4xpPageContributionOptions | XP.PageContributions | string | undefined
  if (preview && preview.pageContributions) {
    pageContributions = preview.pageContributions
  }

  const language: Language = getLanguage(page)
  const menuCacheLanguage: string = language.code === 'en' ? 'en' : 'nb'
  const headerContent: MenuContent | unknown = fromMenuCache(req, `header_${menuCacheLanguage}`, () => {
    return getHeaderContent(language)
  })
  const headerComponent: React4xpObject = new React4xp('Header')
    .setProps({
      ...headerContent as object,
      language: language,
      searchResult: req.params.sok
    })
    .setId('header')

  const header: MenuContent = {
    body: headerComponent.renderBody({
      body: '<div id="header"></div>'
    }),
    component: headerComponent
  }

  if (header && header.component) {
    pageContributions = header.component.renderPageContributions({
      pageContributions: pageContributions as React4xpPageContributionOptions

    })
  }

  const footer: MenuContent | unknown = fromMenuCache(req, `footer_${menuCacheLanguage}`, () => {
    const footerContent: FooterContent | undefined = getFooterContent(language )
    if (footerContent) {
      const footerComponent: React4xpObject = new React4xp('Footer')
        .setProps({
          ...footerContent,
          language: language
        })
        .setId('footer')
      return {
        body: footerComponent.renderBody({
          body: '<footer id="footer"></footer>'
        }),
        component: footerComponent
      }
    }
    return undefined
  })

  if (footer && (footer as MenuContent).component) {
    pageContributions = (footer as MenuContent).component.renderPageContributions({
      pageContributions: pageContributions as React4xpPageContributionOptions
    })
  }

  let municipality: MunicipalityWithCounty | undefined
  if (req.params.selfRequest) {
    municipality = getMunicipality(req)
  }

  const pageType: string = pageConfig.pageType ? pageConfig.pageType : 'default'
  let municipalPageType: string | undefined
  if (pageType === 'municipality') {
    if (page._path.includes('/kommunefakta/')) {
      municipalPageType = 'kommunefakta'
    }
    if (page._path.includes('/kommuneareal/')) {
      municipalPageType = 'kommuneareal'
    }
    if (page._path.includes('/barn-og-unge/')) {
      municipalPageType = 'barn-og-unge'
    }
  }

  const metaInfo: MetaInfoData = parseMetaInfoData(municipality, pageType, page, language, req)

  const statbankFane: boolean = (req.params.xpframe === 'statbank')
  const statBankContent: StatbankFrameData = parseStatbankFrameContent(statbankFane, req, page)

  const breadcrumbs: Breadcrumbs = getBreadcrumbs(page, municipality, statbankFane ? statBankContent : undefined)

  const breadcrumbComponent: React4xpObject = new React4xp('Breadcrumb')
  breadcrumbComponent.setProps({
    items: breadcrumbs
  })
    .setId('breadcrumbs')
    .uniqueId()

  const hideBreadcrumb: boolean = !!(pageConfig).hide_breadcrumb
  const innrapporteringRegexp: RegExp = /^\/ssb(\/en)?\/innrapportering/ // Skal matche alle sider under /innrapportering på norsk og engelsk
  const model: DefaultModel = {
    pageTitle: 'SSB', // not really used on normal pages because of SEO app (404 still uses this)
    page,
    ...regions,
    ingress,
    showIngress,
    preview,
    bodyClasses: bodyClasses.join(' '),
    stylesUrl,
    jsLibsUrl,
    ieUrl,
    language,
    statbankWeb: statbankFane,
    ...statBankContent,
    GA_TRACKING_ID,
    headerBody: header ? header.body : undefined,
    footerBody: footer ? (footer as MenuContent).body : undefined,
    ...metaInfo,
    breadcrumbsReactId: breadcrumbComponent.react4xpId,
    hideBreadcrumb,
    enabledEnalyzerScript: isEnabled('enable-enalyzer-script', true, 'ssb'),
    enabledChatScript: isEnabled('enable-chat-script', true, 'ssb') && innrapporteringRegexp.exec(page._path)
  }

  const thymeleafRenderBody: XP.Response['body'] = render(view, model)

  const bodyWithBreadCrumbs: string | boolean = !hideBreadcrumb && breadcrumbComponent.renderBody({
    body: thymeleafRenderBody
  })

  if (!hideBreadcrumb) {
    pageContributions = breadcrumbComponent.renderPageContributions({
      pageContributions: pageContributions as React4xpPageContributionOptions
    })
  }

  const alertOptions: MunicipalityOptions | InformationAlertOptions = pageConfig && (pageConfig).pageType === 'municipality' ? {
    municipality,
    municipalPageType
  } as MunicipalityOptions : {
    pageType: page.type,
    pageTypeId: page._id,
    statbankWeb: statbankFane || page._path === '/ssb/statbank'
  } as InformationAlertOptions

  const alerts: AlertType = alertsForContext(pageConfig, alertOptions)
  const body: string = bodyWithBreadCrumbs ? bodyWithBreadCrumbs : thymeleafRenderBody
  const bodyWithAlerts: XP.Response = alerts.length ?
    addAlerts(alerts, body, pageContributions as React4xpPageContributionOptions) :
    {
      body,
      pageContributions
    } as XP.Response

  return {
    body: `<!DOCTYPE html>${bodyWithAlerts.body}`,
    pageContributions: bodyWithAlerts.pageContributions,
    headers: {
      'x-content-key': page._id
    }
  } as XP.Response
}

function prepareRegions(isFragment: boolean, page: DefaultPage): RegionsContent {
  let regions: Regions = {}
  let configRegions: ExtendedPage['config']['regions'] = []
  if (isFragment) {
    regions = page.fragment && page.fragment.regions ? page.fragment.regions : {}
  } else {
    const pageData: ExtendedPage = page.page
    if (pageData) {
      regions = pageData.regions ? pageData.regions : {}
      configRegions = pageData.config && pageData.config.regions ? forceArray(pageData.config.regions) : []
    }
  }
  configRegions.forEach((configRegion) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    configRegion.components = regions[configRegion.region] ? forceArray(regions[configRegion.region].components) : []
  })

  const mainRegionData: Regions['components'] | undefined = regions && regions.main && regions.main.components.length > 0 ? regions.main.components : undefined

  return {
    mainRegionData,
    configRegions
  }
}

function parseMetaInfoData(
  municipality: MunicipalityWithCounty | undefined,
  pageType: string,
  page: DefaultPage,
  language: Language,
  req: XP.Request): MetaInfoData {
  let addMetaInfoSearch: boolean = true
  let metaInfoSearchId: string | undefined = page._id
  let metaInfoSearchContentType: string | undefined
  let metaInfoSearchGroup: string | undefined = page._id
  let metaInfoSearchKeywords: string | undefined
  let metaInfoDescription: string | undefined
  let metaInfoSearchPublishFrom: string | undefined = page.publish && page.publish.from
  let metaInfoMainSubject: string | undefined

  if (pageType === 'municipality') {
    metaInfoSearchContentType = 'kommunefakta'
    metaInfoSearchKeywords = 'kommune, kommuneprofil',
    metaInfoDescription = (getContent() as Content<Content, object, SEO>).x['com-enonic-app-metafields']['meta-data'].seoDescription
  }

  if (pageType === 'municipality' && municipality) {
    addMetaInfoSearch = true
    metaInfoSearchId = metaInfoSearchId + '_' + municipality.code
    metaInfoSearchGroup = metaInfoSearchGroup + '_' + municipality.code
    metaInfoSearchKeywords = municipality.displayName + ' kommune'
  }

  if (pageType === 'factPage') {
    metaInfoSearchContentType = 'faktaside'
  }

  if (page.type === `${app.name}:article` || page.type === `${app.name}:statistics` ) {
    const mainSubjects: string = getSubjectsPage(page, req, language.code as string).join(';')
    metaInfoMainSubject = mainSubjects
  }

  if (page.type === `${app.name}:statistics`) {
    const statistic: StatisticInListing | undefined = getStatisticByIdFromRepo(page.data.statistic)
    if (statistic) {
      const variants: Array<VariantInListing | undefined> = forceArray(statistic.variants)
      const releaseDates: ReleaseDatesVariant = getReleaseDatesByVariants(variants as Array<VariantInListing>)
      const previousRelease: string = releaseDates.previousRelease[0]
      metaInfoSearchPublishFrom = previousRelease ? new Date(previousRelease).toISOString() : new Date().toISOString()
    }
    metaInfoSearchContentType = 'statistikk'
    metaInfoDescription = (getContent() as Content<Content, object, SEO>).x['com-enonic-app-metafields']['meta-data'].seoDescription || ''
    metaInfoSearchKeywords = page.data.keywords ? page.data.keywords : ''
  }

  if (page.type === `${app.name}:article`) {
    if (page.data.articleType == 'report' || page.data.articleType == 'note' ) {
      // We use the old content type publikasjon for this, as we want to group these three together in the search results filter.
      // Note and Report are the new content types that replaces Publikasjon.
      metaInfoSearchContentType = 'publikasjon'
    } else {
      metaInfoSearchContentType = 'artikkel'
    }
  }

  return {
    addMetaInfoSearch,
    metaInfoSearchId,
    metaInfoSearchGroup,
    metaInfoSearchContentType,
    metaInfoSearchKeywords,
    metaInfoDescription,
    metaInfoSearchPublishFrom,
    metaInfoMainSubject
  }
}

function getSubjectsPage(page: DefaultPage, req: XP.Request, language: string): Array<string> {
  const allMainSubjects: Array<SubjectItem> = getMainSubjects(req, language === 'en' ? 'en' : 'nb')
  const allSubSubjects: Array<SubjectItem> = getSubSubjects(req, language === 'en' ? 'en' : 'nb')
  const subjects: Array<string> = []
  const subTopics: Array<string> = page.data.subtopic ? forceArray(page.data.subtopic) : []
  const mainSubject: SubjectItem | undefined = allMainSubjects.find((mainSubject) => {
    return page._path.startsWith(mainSubject.path)
  })

  if (mainSubject) {
    subjects.push(mainSubject.title)
  }

  const secondaryMainSubjects: Array<string> = subTopics ? getSecondaryMainSubject(subTopics, allMainSubjects, allSubSubjects) : []
  secondaryMainSubjects.map((subject) => {
    if (!subjects.includes(subject)) {
      subjects.push(subject)
    }
  })

  return subjects
}

function getSecondaryMainSubject(subtopicsContent: Array<string>, mainSubjects: Array<SubjectItem>, subSubjects: Array<SubjectItem> ): Array<string> {
  const secondaryMainSubjects: Array<string> = subtopicsContent.reduce((acc: Array<string>, topic: string) => {
    const subSubject: SubjectItem = subSubjects.filter((subSubject) => subSubject.id === topic)[0]
    if (subSubject) {
      const mainSubject: SubjectItem| undefined = getMainSubjectBySubSubject(subSubject, mainSubjects)
      if (mainSubject && !acc.includes(mainSubject.title)) {
        acc.push(mainSubject.title)
      }
    }
    return acc
  }, [])
  return secondaryMainSubjects
}

function parseStatbankFrameContent(statbankFane: boolean, req: XP.Request, page: DefaultPage): StatbankFrameData {
  const baseUrl: string = app.config && app.config['ssb.baseUrl'] ? app.config['ssb.baseUrl'] : 'https://www.ssb.no'
  let pageLanguage: string | undefined = page.language ? page.language : 'nb'

  let filteredStatistics: StatisticInListing | undefined = undefined
  // If req.params.shortname exists, the xp frame fallback (system/xpramme) is in use
  // Since the fallback will only either be in bokmål or english, we will have to run two queries
  const statisticInXP: Content<Statistics> | undefined = req.params.shortname ? query({
    count: 1,
    query: `_path LIKE "*/${req.params.shortname}" AND language = "${pageLanguage}"`,
    contentTypes: [`${app.name}:statistics`]
  }).hits[0] as Content<Statistics> : undefined

  const nynorskStatisticInXP: Content<Statistics> | undefined = req.params.shortname ? query({
    count: 1,
    query: `_path LIKE "*/${req.params.shortname}" AND language = "nn"`,
    contentTypes: [`${app.name}:statistics`]
  }).hits[0] as Content<Statistics> : undefined

  if (statbankFane) {
    if (statisticInXP || nynorskStatisticInXP) {
      filteredStatistics = getStatisticByIdFromRepo(statisticInXP ? statisticInXP.data.statistic : nynorskStatisticInXP?.data.statistic)
      // In order to get the correct phrases for the localized strings, we need to get the language from the content itself
      // rather than the language from the xp frame fallback page
      pageLanguage = statisticInXP ? statisticInXP.language : nynorskStatisticInXP?.language
    } else {
      filteredStatistics = getStatisticByShortNameFromRepo(req.params.shortname)
    }
  }

  let statbankStatisticsUrl: string = baseUrl + page._path.substr(4)
  let statbankStatisticsTitle: string = page.displayName
  if (filteredStatistics) {
    if (pageLanguage === 'en') {
      statbankStatisticsUrl = `${baseUrl}/en/${filteredStatistics.shortName}`
      statbankStatisticsTitle = filteredStatistics.nameEN
    } else {
      statbankStatisticsUrl = `${baseUrl}/${filteredStatistics.shortName}`
      statbankStatisticsTitle = filteredStatistics.name
    }
  }

  const siteConfig: SiteConfig = getSiteConfig()

  let statbankHelpLink: string = siteConfig.statbankHelpLink
  if ( pageLanguage === 'en') {
    statbankHelpLink = '/en' + siteConfig.statbankHelpLink
  }
  const statbankHelpText: string = localize({
    key: 'statbankHelpText',
    locale: pageLanguage === 'nb' ? 'no' : pageLanguage
  })
  const statbankMainFigures: string = localize({
    key: 'statbankMainFigures',
    locale: pageLanguage === 'nb' ? 'no' : pageLanguage
  })
  const statbankFrontPage: string = localize({
    key: 'statbankFrontPage',
    locale: pageLanguage === 'nb' ? 'no' : pageLanguage
  })

  return {
    statbankHelpText,
    statbankHelpLink,
    statbankFrontPage,
    statbankMainFigures,
    statbankStatisticsUrl,
    statbankStatisticsTitle,
    statisticsPageContent: statisticInXP ? statisticInXP : nynorskStatisticInXP
  }
}

function addAlerts(alerts: AlertType, body: string, pageContributions: React4xpPageContributionOptions | undefined): XP.Response {
  const alertComponent: React4xpObject = new React4xp('Alerts')
    .setProps({
      alerts
    })
    .setId('alerts')
  return {
    body: alertComponent.renderBody({
      body
    }),
    pageContributions: alertComponent.renderPageContributions({
      pageContributions
    }) as XP.PageContributions | undefined
  }
}

interface DefaultPage extends Content {
  fragment?: {
    regions: Regions;
    config: DefaultPageConfig;
  };
  data: {
    ingress: string;
    keywords: string;
    statistic: string;
    subtopic: Array<string>;
    articleType: string;
  };
  page: ExtendedPage;
}

interface ExtendedPage extends Page<object>{
  config: DefaultPageConfig;
}

interface Regions {
  components?: object;
  region?: RegionData;
  main?: {
    components: Array<RegionData>;
  };
}
interface RegionData {
  path: string;
  type: string;
  descriptor: string;
}
interface Controller {
  preview: (req: XP.Request, id: string) => XP.Response;
}

interface MenuContent {
  body: string;
  component: React4xpObject;
}

interface RegionsContent {
  mainRegionData: Regions | undefined;
  configRegions: ExtendedPage['config']['regions'];
}

interface MetaInfoData {
  addMetaInfoSearch: boolean;
  metaInfoSearchId: string | undefined;
  metaInfoSearchGroup: string | undefined;
  metaInfoSearchContentType: string | undefined;
  metaInfoSearchKeywords: string | undefined;
  metaInfoDescription: string | undefined;
  metaInfoSearchPublishFrom: string | undefined;
  metaInfoMainSubject: string | undefined;
}

export interface StatbankFrameData {
  statbankHelpText: string;
  statbankHelpLink: string;
  statbankFrontPage: string;
  statbankMainFigures: string;
  statbankStatisticsUrl: string;
  statbankStatisticsTitle: string;
  statisticsPageContent: Content<Statistics> | undefined;
}

interface DefaultModel {
  pageTitle: string;
  page: Content;
  ingress: string | undefined;
  showIngress: string | boolean | undefined;
  preview: XP.Response | undefined;
  bodyClasses: string;
  stylesUrl: string;
  jsLibsUrl: string;
  ieUrl: string;
  language: Language;
  statbankWeb: boolean;
  GA_TRACKING_ID: string | null;
  headerBody: string | undefined;
  footerBody: string| undefined;
  breadcrumbsReactId: string | undefined;
  hideBreadcrumb: boolean;
  enabledEnalyzerScript: boolean;
  enabledChatScript: boolean;
}
