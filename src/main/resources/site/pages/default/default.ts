/* eslint-disable complexity */
import { type Content, query } from '/lib/xp/content'
import { assetUrl, type Component, getContent, getSiteConfig, pageUrl, processHtml } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { render } from '/lib/thymeleaf'
import {
  type ReleaseDatesVariant,
  type StatisticInListing,
  type VariantInListing,
} from '/lib/ssb/dashboard/statreg/types'
import { type MunicipalityWithCounty, getMunicipality, RequestWithCode } from '/lib/ssb/dataset/klass/municipalities'
import { type FooterContent, getFooterContent } from '/lib/ssb/parts/footer'
import {
  type AlertType,
  type InformationAlertOptions,
  type MunicipalityOptions,
  alertsForContext,
} from '/lib/ssb/utils/alertUtils'
import { type Breadcrumbs, getBreadcrumbs } from '/lib/ssb/utils/breadcrumbsUtils'
import {
  type SubjectItem,
  getMainSubjects,
  getSubSubjects,
  getMainSubjectBySubSubject,
} from '/lib/ssb/utils/subjectUtils'
import { type Language } from '/lib/types/language'
import { render as r4xpRender } from '/lib/enonic/react4xp'

import * as util from '/lib/util'
import { getLanguage } from '/lib/ssb/utils/language'
import {
  getReleaseDatesByVariants,
  getStatisticByIdFromRepo,
  getStatisticByShortNameFromRepo,
} from '/lib/ssb/statreg/statistics'
import { getHeaderContent } from '/lib/ssb/parts/header'
import { fromMenuCache } from '/lib/ssb/cache/cache'

import { isEnabled } from '/lib/featureToggle'
import { type Default as DefaultPageConfig } from '/site/pages/default'
import { type Page, type Statistics } from '/site/content-types'

const partsWithPreview: Array<string> = [
  // Parts that has preview
  `${app.name}:map`,
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
  `${app.name}:staticVisualization`,
  `${app.name}:employee`,
  `${app.name}:project`,
  `${app.name}:combinedGraph`,
]

const previewOverride: object = {
  contentList: 'relatedFactPage',
}

export const GA_TRACKING_ID: string | null = app.config?.GA_TRACKING_ID || null
export const GTM_TRACKING_ID: string | null = app.config?.GTM_TRACKING_ID || null
export const GTM_AUTH: string | null = app.config?.GTM_AUTH || null

const view = resolve('default.html')

export function get(req: XP.Request): XP.Response {
  const page = getContent<Content<Page> & DefaultPage>()
  if (!page) return { status: 404 }

  const pageConfig: DefaultPageConfig = page.page?.config

  const ingress: string | undefined = page.data.ingress
    ? processHtml({
        value: page.data.ingress.replace(/&nbsp;/g, ' '),
      })
    : undefined
  const showIngress: string | boolean | undefined = ingress && page.type === 'mimir:page'

  // Create preview if available
  let preview: XP.Response | undefined
  if (partsWithPreview.includes(page.type)) {
    let name: string = page.type.replace(/^.*:/, '')
    // @ts-ignore
    if (previewOverride[name]) {
      // @ts-ignore
      name = previewOverride[name]
    }

    // Our build system can't handle a wildcard require directly. All builders assume you are node or browser, since we are not we need to circumvent this.
    // If we use a require directly it gets swapped out with a errounous function. Bybass by proxying through a variable
    const _require = require
    const controller: Controller = _require(`../../parts/${name}/${name}`)
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
    path: 'styles/bundle.css',
  })

  const jsLibsUrl: string = assetUrl({
    path: 'js/bundle.js',
  })

  const ieUrl: string = assetUrl({
    path: '/js/ie.js',
  })

  let pageContributions: XP.PageContributions | undefined
  if (preview && preview.pageContributions) {
    pageContributions = preview.pageContributions
  }
  const language: Language = getLanguage(page) as Language
  const menuCacheLanguage: string = language.code === 'en' ? 'en' : 'nb'
  const hideHeader = isEnabled('hide-header-in-qa', false, 'ssb') ? pageConfig?.hideHeader : false
  let header
  if (!hideHeader) {
    const headerContent: MenuContent | unknown = fromMenuCache(req, `header_${menuCacheLanguage}`, () => {
      return getHeaderContent(language)
    })
    header = r4xpRender(
      'Header',
      {
        ...(headerContent as object),
        language: language,
        searchResult: req.params.sok,
      },
      req,
      {
        id: 'header',
        body: '<div id="header"></div>',
        pageContributions,
      }
    )

    if (header) {
      pageContributions = header.pageContributions
    }
  }

  const footerContent: FooterContent | unknown = fromMenuCache(req, `footer_${menuCacheLanguage}`, () => {
    return getFooterContent(language)
  })
  const footer = r4xpRender(
    'Footer',
    {
      ...(footerContent as object),
      language: language,
    },
    req,
    {
      id: 'footer',
      body: '<footer id="footer"></footer>',
      pageContributions,
    }
  )

  if (footer) {
    pageContributions = footer.pageContributions
  }

  let municipality: MunicipalityWithCounty | undefined
  if (req.params.selfRequest) {
    municipality = getMunicipality(req as RequestWithCode)
  }

  const pageType: string = pageConfig?.pageType || 'default'
  const baseUrl: string =
    app.config && app.config['ssb.baseUrl'] ? (app.config['ssb.baseUrl'] as string) : 'https://www.ssb.no'
  let canonicalUrl: string | undefined = `${baseUrl}${pageUrl({
    path: page._path,
  })}`
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
    if (page._path.includes('/jakt-i-din-kommune/')) {
      municipalPageType = 'jakt-i-din-kommune'
    }
  }

  if (pageType === 'municipality' && municipality) {
    canonicalUrl = `${baseUrl}/${municipalPageType}${municipality.path}`
  }

  const metaInfo: MetaInfoData = parseMetaInfoData(municipality, pageType, page, language, req)

  const statbankFane: boolean = req.params.xpframe === 'statbank'
  const statBankContent: StatbankFrameData = parseStatbankFrameContent(statbankFane, req, page)
  if (statbankFane) {
    canonicalUrl = undefined
  }

  const breadcrumbs: Breadcrumbs = getBreadcrumbs(
    page as unknown as Content,
    municipality,
    statbankFane ? statBankContent : undefined
  )
  const breadcrumbId = 'breadcrumbs'
  const hideBreadcrumb = !!pageConfig?.hide_breadcrumb

  const model: DefaultModel = {
    isFragment,
    pageTitle: 'SSB', // not really used on normal pages because of SEO app (404 still uses this)
    canonicalUrl,
    page: page as unknown as Content,
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
    GTM_TRACKING_ID,
    GTM_AUTH,
    headerBody: header?.body,
    footerBody: footer?.body,
    ...metaInfo,
    breadcrumbsReactId: breadcrumbId,
    hideHeader,
    hideBreadcrumb,
    tableView: page.type === 'mimir:table',
  }

  const thymeleafRenderBody = render(view, model)

  const breadcrumbComponent = r4xpRender(
    'Breadcrumb',
    {
      items: breadcrumbs,
    },
    req,
    {
      id: breadcrumbId,
      body: thymeleafRenderBody,
      pageContributions,
    }
  )

  const bodyWithBreadCrumbs: string | boolean = !hideBreadcrumb && breadcrumbComponent.body

  if (!hideBreadcrumb) {
    pageContributions = breadcrumbComponent.pageContributions
  }

  const alertOptions: MunicipalityOptions | InformationAlertOptions =
    pageConfig && pageConfig.pageType === 'municipality'
      ? ({
          municipality,
          municipalPageType,
        } as MunicipalityOptions)
      : ({
          pageType: page.type,
          pageTypeId: page._id,
          statbankWeb: statbankFane || page._path === '/ssb/statbank',
        } as InformationAlertOptions)

  const alerts: AlertType = alertsForContext(pageConfig, alertOptions)
  const body: string = bodyWithBreadCrumbs ? breadcrumbComponent.body : thymeleafRenderBody
  const bodyWithAlerts: XP.Response = alerts.length
    ? addAlerts(alerts, body, pageContributions, req)
    : ({
        body,
        pageContributions,
      } as XP.Response)

  return {
    body: `<!DOCTYPE html>${bodyWithAlerts.body}`,
    pageContributions: bodyWithAlerts.pageContributions,
    headers: {
      'x-content-key': page._id,
    },
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
      configRegions = pageData.config && pageData.config.regions ? util.data.forceArray(pageData.config.regions) : []
    }
  }
  configRegions.forEach((configRegion) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    configRegion.components = regions[configRegion.region]
      ? util.data.forceArray(regions[configRegion.region].components)
      : []
  })

  const mainRegionData: Regions['components'] | undefined =
    regions && regions.main && regions.main.components.length > 0 ? regions.main.components : undefined

  return {
    mainRegionData,
    configRegions,
  }
}

function parseMetaInfoData(
  municipality: MunicipalityWithCounty | undefined,
  pageType: string,
  page: DefaultPage,
  language: Language,
  req: XP.Request
): MetaInfoData {
  let addMetaInfoSearch = true
  let metaInfoSearchId: string | undefined = page._id
  let metaInfoSearchContentType: string | undefined
  let metaInfoSearchGroup: string | undefined = page._id
  let metaInfoSearchKeywords: string | undefined
  let metaInfoDescription: string | undefined
  let metaInfoSearchPublishFrom: string | undefined = page.publish && page.publish.from
  let metaInfoMainSubject: string | undefined

  if (pageType === 'municipality') {
    metaInfoSearchContentType = 'kommunefakta'
    metaInfoSearchKeywords = 'kommune, kommuneprofil'
    metaInfoDescription = page.x['com-enonic-app-metafields']?.['meta-data']?.seoDescription
  }

  if (pageType === 'municipality' && page._name === 'kommune' && !municipality) {
    addMetaInfoSearch = false
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

  if (page.type === `${app.name}:article` || page.type === `${app.name}:statistics`) {
    const mainSubjects: string = getSubjectsPage(page, req, language.code as string).join(';')
    metaInfoMainSubject = mainSubjects
  }

  if (page.type === `${app.name}:statistics`) {
    const statistic: StatisticInListing | undefined = getStatisticByIdFromRepo(page.data.statistic)
    if (statistic) {
      const variants: Array<VariantInListing | undefined> = util.data.forceArray(statistic.variants)
      const releaseDates: ReleaseDatesVariant = getReleaseDatesByVariants(variants as Array<VariantInListing>)
      const previousRelease: string = releaseDates.previousRelease[0]
      metaInfoSearchPublishFrom = previousRelease ? new Date(previousRelease).toISOString() : new Date().toISOString()
    }
    metaInfoSearchContentType = 'statistikk'
    metaInfoDescription = page.x['com-enonic-app-metafields']?.['meta-data']?.seoDescription || ''
    metaInfoSearchKeywords = page.data.keywords ? page.data.keywords : ''
  }

  if (page.type === `${app.name}:article`) {
    metaInfoSearchContentType = page.data.articleType ? page.data.articleType : 'artikkel'
  }

  return {
    addMetaInfoSearch,
    metaInfoSearchId,
    metaInfoSearchGroup,
    metaInfoSearchContentType,
    metaInfoSearchKeywords,
    metaInfoDescription,
    metaInfoSearchPublishFrom,
    metaInfoMainSubject,
  }
}

function getSubjectsPage(page: DefaultPage, req: XP.Request, language: string): Array<string> {
  const allMainSubjects: Array<SubjectItem> = getMainSubjects(req, language === 'en' ? 'en' : 'nb')
  const allSubSubjects: Array<SubjectItem> = getSubSubjects(req, language === 'en' ? 'en' : 'nb')
  const subjects: Array<string> = []
  const subTopics: Array<string> = page.data.subtopic ? util.data.forceArray(page.data.subtopic) : []
  const mainSubject: SubjectItem | undefined = allMainSubjects.find((mainSubject) => {
    return page._path.startsWith(mainSubject.path)
  })

  if (mainSubject) {
    subjects.push(mainSubject.title)
  }

  const secondaryMainSubjects: Array<string> = subTopics
    ? getSecondaryMainSubject(subTopics, allMainSubjects, allSubSubjects)
    : []
  secondaryMainSubjects.forEach((subject) => {
    if (!subjects.includes(subject)) {
      subjects.push(subject)
    }
  })

  return subjects
}

function getSecondaryMainSubject(
  subtopicsContent: Array<string>,
  mainSubjects: Array<SubjectItem>,
  subSubjects: Array<SubjectItem>
): Array<string> {
  const secondaryMainSubjects: Array<string> = subtopicsContent.reduce((acc: Array<string>, topic: string) => {
    const subSubject: SubjectItem = subSubjects.filter((subSubject) => subSubject.id === topic)[0]
    if (subSubject) {
      const mainSubject: SubjectItem | undefined = getMainSubjectBySubSubject(subSubject, mainSubjects)
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
  const statisticInXP: Content<Statistics> | undefined = req.params.shortname
    ? query<Content<Statistics>>({
        count: 1,
        query: `_path LIKE "*/${req.params.shortname}" AND language = "${pageLanguage}"`,
        contentTypes: [`${app.name}:statistics`],
      }).hits[0]
    : undefined

  const nynorskStatisticInXP: Content<Statistics> | undefined = req.params.shortname
    ? query<Content<Statistics>>({
        count: 1,
        query: `_path LIKE "*/${req.params.shortname}" AND language = "nn"`,
        contentTypes: [`${app.name}:statistics`],
      }).hits[0]
    : undefined

  if (statbankFane) {
    if (statisticInXP || nynorskStatisticInXP) {
      filteredStatistics = getStatisticByIdFromRepo(
        statisticInXP ? statisticInXP.data.statistic : nynorskStatisticInXP?.data.statistic
      )
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

  const siteConfig = getSiteConfig<XP.SiteConfig>() as XP.SiteConfig

  let statbankHelpLink: string = siteConfig.statbankHelpLink
  if (pageLanguage === 'en') {
    statbankHelpLink = '/en' + siteConfig.statbankHelpLink
  }
  const statbankHelpText: string = localize({
    key: 'statbankHelpText',
    locale: pageLanguage === 'nb' ? 'no' : pageLanguage,
  })
  const statbankMainFigures: string = localize({
    key: 'statbankMainFigures',
    locale: pageLanguage === 'nb' ? 'no' : pageLanguage,
  })
  const statbankFrontPage: string = localize({
    key: 'statbankFrontPage',
    locale: pageLanguage === 'nb' ? 'no' : pageLanguage,
  })

  return {
    statbankHelpText,
    statbankHelpLink,
    statbankFrontPage,
    statbankMainFigures,
    statbankStatisticsUrl,
    statbankStatisticsTitle,
    statisticsPageContent: statisticInXP ? statisticInXP : nynorskStatisticInXP,
  }
}

function addAlerts(
  alerts: AlertType,
  body: string,
  pageContributions: XP.PageContributions | undefined,
  req: XP.Request
): XP.Response {
  return r4xpRender(
    'Alerts',
    {
      alerts,
    },
    req,
    {
      id: 'alerts',
      body: body,
      pageContributions: pageContributions,
    }
  )
}

interface DefaultPage extends Content {
  fragment?: {
    regions: Regions
    config: DefaultPageConfig
  }
  data: {
    ingress: string
    keywords: string
    statistic: string
    subtopic: Array<string>
    articleType: string
  }
  page: ExtendedPage
}

interface ExtendedPage extends Component<object> {
  config: DefaultPageConfig
}

interface Regions {
  components?: object
  region?: RegionData
  main?: {
    components: Array<RegionData>
  }
}

interface RegionData {
  path: string
  type: string
  descriptor: string
}

interface Controller {
  preview: (req: XP.Request, id: string) => XP.Response
}

interface MenuContent {
  body: string
  component: XP.Response
}

interface RegionsContent {
  mainRegionData: Regions | undefined
  configRegions: ExtendedPage['config']['regions']
}

interface MetaInfoData {
  addMetaInfoSearch: boolean
  metaInfoSearchId: string | undefined
  metaInfoSearchGroup: string | undefined
  metaInfoSearchContentType: string | undefined
  metaInfoSearchKeywords: string | undefined
  metaInfoDescription: string | undefined
  metaInfoSearchPublishFrom: string | undefined
  metaInfoMainSubject: string | undefined
}

export interface StatbankFrameData {
  statbankHelpText: string
  statbankHelpLink: string
  statbankFrontPage: string
  statbankMainFigures: string
  statbankStatisticsUrl: string
  statbankStatisticsTitle: string
  statisticsPageContent: Content<Statistics> | undefined
}

interface DefaultModel {
  isFragment: boolean
  pageTitle: string
  canonicalUrl: string | undefined
  page: Content
  ingress: string | undefined
  showIngress: string | boolean | undefined
  preview: XP.Response | undefined
  bodyClasses: string
  stylesUrl: string
  jsLibsUrl: string
  ieUrl: string
  language: Language
  statbankWeb: boolean
  GA_TRACKING_ID: string | null
  GTM_TRACKING_ID: string | null
  GTM_AUTH: string | null
  headerBody: string | undefined
  footerBody: string | undefined
  breadcrumbsReactId: string | undefined
  hideHeader: boolean
  hideBreadcrumb: boolean
  tableView: boolean
}
