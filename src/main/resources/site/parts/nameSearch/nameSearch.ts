import { Component } from 'enonic-types/portal'
import { renderError } from '../../../lib/ssb/error/error'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { GA_TRACKING_ID } from '../../pages/default/default'
import { NameSearchPartConfig } from './nameSearch-part-config'

const {
  getComponent,
  getContent,
  pageUrl,
  serviceUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  getLanguageShortName
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  localize
} = __non_webpack_require__('/lib/xp/i18n')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')


exports.get = (req: XP.Request): React4xpResponse | XP.Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part ', e)
  }
}

exports.preview = (req: XP.Request): React4xpResponse => renderPart(req)

function renderPart(req: XP.Request): React4xpResponse {
  const component: Component<NameSearchPartConfig> = getComponent()
  const locale: string = getLanguageShortName(getContent())
  const isNotInEditMode: boolean = req.mode !== 'edit'

  const urlToService: string = serviceUrl({
    service: 'nameSearch'
  })

  const urlToGraphService: string = serviceUrl({
    service: 'nameGraph'
  })

  const props: PartProperties = {
    urlToService: urlToService,
    urlToGraphService: urlToGraphService,
    aboutLink: aboutLinkResources(component.config),
    nameSearchDescription: component.config.nameSearchDescription,
    frontPage: component.config.frontPage,
    phrases: partsPhrases(locale),
    language: locale,
    GA_TRACKING_ID: GA_TRACKING_ID
  }

  return React4xp.render('site/parts/nameSearch/nameSearch', props, req, {
    clientRender: isNotInEditMode
  })
}

function aboutLinkResources(config: Component<NameSearchPartConfig>['config']): PartProperties['aboutLink'] | undefined {
  if (config.aboutLinkTitle && config.aboutLinkTarget) {
    return {
      title: config.aboutLinkTitle,
      url: pageUrl({
        id: config.aboutLinkTarget
      })
    }
  }
  return undefined
}

function partsPhrases(locale: string): PartProperties['phrases'] {
  return {
    nameSearchTitle: localize({
      key: 'nameSearch.title',
      locale
    }),
    nameSearchInputLabel: localize({
      key: 'nameSearch.inputLabel',
      locale
    }),
    nameSearchButtonText: localize({
      key: 'nameSearch.buttonText',
      locale
    }),
    interestingFacts: localize({
      key: 'nameSearch.interestingFacts',
      locale
    }),
    nameSearchResultTitle: localize({
      key: 'nameSearch.resultTitle',
      locale
    }),
    thereAre: localize({
      key: 'nameSearch.thereAre',
      locale
    }),
    with: localize({
      key: 'nameSearch.with',
      locale
    }),
    have: localize({
      key: 'nameSearch.have',
      locale
    }),
    asTheir: localize({
      key: 'nameSearch.asTheir',
      locale
    }),
    errorMessage: localize({
      key: 'nameSearch.errorMessage',
      locale
    }),
    networkErrorMessage: localize({
      key: 'nameSearch.networkError',
      locale
    }),
    threeOrLessText: localize({
      key: 'nameSearch.threeOrLessText',
      locale
    }),
    yAxis: localize({
      key: 'nameSearch.graph.yaxis',
      locale
    }),
    graphHeader: localize({
      key: 'nameSearch.graph.header',
      locale
    }),
    loadingGraph: localize({
      key: 'nameSearch.graph.loading',
      locale
    }),
    historicalTrend: localize({
      key: 'nameSearch.historicalTrend',
      locale
    }),
    chart: localize({
      key: 'nameSearch.chart',
      locale
    }),
    women: localize({
      key: 'women',
      locale
    }),
    men: localize({
      key: 'men',
      locale
    }),
    types: {
      firstgivenandfamily: localize({
        key: 'nameSearch.types.firstgivenandfamily',
        locale
      }),
      middleandfamily: localize({
        key: 'nameSearch.types.middleandfamily',
        locale
      }),
      family: localize({
        key: 'nameSearch.types.family',
        locale
      }),
      onlygiven: localize({
        key: 'nameSearch.types.onlygiven',
        locale
      }),
      onlygivenandfamily: localize({
        key: 'nameSearch.types.onlygivenandfamily',
        locale
      }),
      firstgiven: localize({
        key: 'nameSearch.types.firstgiven',
        locale
      })
    },
    printChart: localize({
      key: 'highcharts.printChart',
      locale
    }),
    downloadPNG: localize({
      key: 'highcharts.downloadPNG',
      locale
    }),
    downloadJPEG: localize({
      key: 'highcharts.downloadJPEG',
      locale
    }),
    downloadPDF: localize({
      key: 'highcharts.downloadPDF',
      locale
    }),
    downloadSVG: localize({
      key: 'highcharts.downloadSVG',
      locale
    }),
    downloadCSV: localize({
      key: 'highcharts.downloadCSV',
      locale
    }),
    downloadXLS: localize({
      key: 'highcharts.downloadXLS',
      locale
    }),
    chartContainerLabel: localize({
      key: 'highcharts.chartContainerLabel',
      locale
    }),
    chartMenuLabel: localize({
      key: 'highcharts.chartMenuLabel',
      locale
    }),
    menuButtonLabel: localize({
      key: 'highcharts.menuButtonLabel',
      locale
    }),
    beforeRegionLabel: localize({
      key: 'highcharts.beforeRegionLabel',
      locale
    }),
    legendItem: localize({
      key: 'highcharts.legendItem',
      locale
    }),
    legendLabel: localize({
      key: 'highcharts.legendLabel',
      locale
    }),
    legendLabelNoTitle: localize({
      key: 'highcharts.legendLabelNoTitle',
      locale
    }),
    close: localize({
      key: 'close',
      locale
    })
  }
}

interface PartProperties {
  urlToService: string;
  urlToGraphService: string;
  aboutLink?: {
    title: string;
    url: string;
  };
  nameSearchDescription?: string;
  frontPage: boolean;
  phrases: {
    nameSearchTitle: string;
    nameSearchInputLabel: string;
    nameSearchButtonText: string;
    interestingFacts: string;
    nameSearchResultTitle: string;
    thereAre: string;
    with: string;
    have: string;
    asTheir: string;
    errorMessage: string;
    networkErrorMessage: string;
    threeOrLessText: string;
    yAxis: string;
    graphHeader: string;
    loadingGraph: string;
    historicalTrend: string;
    chart: string;
    women: string;
    men: string;
    types: {
      firstgivenandfamily: string;
      middleandfamily: string;
      family: string;
      onlygiven: string;
      onlygivenandfamily: string;
      firstgiven: string;
    };
    printChart: string;
    downloadPNG: string;
    downloadJPEG: string;
    downloadPDF: string;
    downloadSVG: string;
    downloadCSV: string;
    downloadXLS: string;
    chartContainerLabel: string;
    chartMenuLabel: string;
    menuButtonLabel: string;
    beforeRegionLabel: string;
    legendItem: string;
    legendLabel: string;
    legendLabelNoTitle: string;
    close: string;
  };
  language: string;
  GA_TRACKING_ID: string | null;
}
