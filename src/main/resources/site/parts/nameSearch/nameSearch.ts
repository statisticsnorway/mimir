import { getContent, getComponent, pageUrl, serviceUrl } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { renderError } from '/lib/ssb/error/error'
import { render } from '/lib/enonic/react4xp'
import { type NameSearchProps } from '/lib/types/partTypes/nameSearch'
import { GA_TRACKING_ID } from '/site/pages/default/default'
import { type NameSearch as NameSearchPartConfig } from '.'

export const get = (req: XP.Request): XP.Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part ', e)
  }
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

function renderPart(req: XP.Request) {
  const component = getComponent<XP.PartComponent.NameSearch>()
  if (!component) throw Error('No part found')

  const urlToService: string = serviceUrl({
    service: 'nameSearch',
  })

  const currentContent = getContent()

  const props: NameSearchProps = {
    urlToService: urlToService,
    aboutLink: aboutLinkResources(component.config),
    nameSearchDescription: component.config.nameSearchDescription,
    frontPage: component.config.frontPage,
    phrases: partsPhrases(currentContent?.language || 'nb'),
    language: currentContent?.language || 'nb',
    GA_TRACKING_ID: GA_TRACKING_ID,
  }

  return render('site/parts/nameSearch/nameSearch', props, req)
}

function aboutLinkResources(config: NameSearchPartConfig): NameSearchProps['aboutLink'] | undefined {
  if (config.aboutLinkTitle && config.aboutLinkTarget) {
    return {
      title: config.aboutLinkTitle,
      url: pageUrl({
        id: config.aboutLinkTarget,
      }),
    }
  }
  return undefined
}

function partsPhrases(locale: string): NameSearchProps['phrases'] {
  return {
    nameSearchTitle: localize({
      key: 'nameSearch.title',
      locale,
    }),
    nameSearchInputLabel: localize({
      key: 'nameSearch.inputLabel',
      locale,
    }),
    nameSearchButtonText: localize({
      key: 'nameSearch.buttonText',
      locale,
    }),
    interestingFacts: localize({
      key: 'nameSearch.interestingFacts',
      locale,
    }),
    nameSearchResultTitle: localize({
      key: 'nameSearch.resultTitle',
      locale,
    }),
    thereAre: localize({
      key: 'nameSearch.thereAre',
      locale,
    }),
    with: localize({
      key: 'nameSearch.with',
      locale,
    }),
    have: localize({
      key: 'nameSearch.have',
      locale,
    }),
    asTheir: localize({
      key: 'nameSearch.asTheir',
      locale,
    }),
    errorMessage: localize({
      key: 'nameSearch.errorMessage',
      locale,
    }),
    networkErrorMessage: localize({
      key: 'nameSearch.networkError',
      locale,
    }),
    threeOrLessText: localize({
      key: 'nameSearch.threeOrLessText',
      locale,
    }),
    yAxis: localize({
      key: 'nameSearch.graph.yaxis',
      locale,
    }),
    graphHeader: localize({
      key: 'nameSearch.graph.header',
      locale,
    }),
    loadingGraph: localize({
      key: 'nameSearch.graph.loading',
      locale,
    }),
    threeOrLessTextGraph: localize({
      key: 'nameSearch.graph.threeOrLessText',
      locale,
    }),
    historicalTrend: localize({
      key: 'nameSearch.historicalTrend',
      locale,
    }),
    chart: localize({
      key: 'nameSearch.chart',
      locale,
    }),
    women: localize({
      key: 'women',
      locale,
    }),
    men: localize({
      key: 'men',
      locale,
    }),
    types: {
      firstgivenandfamily: localize({
        key: 'nameSearch.types.firstgivenandfamily',
        locale,
      }),
      middleandfamily: localize({
        key: 'nameSearch.types.middleandfamily',
        locale,
      }),
      family: localize({
        key: 'nameSearch.types.family',
        locale,
      }),
      onlygiven: localize({
        key: 'nameSearch.types.onlygiven',
        locale,
      }),
      onlygivenandfamily: localize({
        key: 'nameSearch.types.onlygivenandfamily',
        locale,
      }),
      firstgiven: localize({
        key: 'nameSearch.types.firstgiven',
        locale,
      }),
    },
    printChart: localize({
      key: 'highcharts.printChart',
      locale,
    }),
    downloadPNG: localize({
      key: 'highcharts.downloadPNG',
      locale,
    }),
    downloadJPEG: localize({
      key: 'highcharts.downloadJPEG',
      locale,
    }),
    downloadPDF: localize({
      key: 'highcharts.downloadPDF',
      locale,
    }),
    downloadSVG: localize({
      key: 'highcharts.downloadSVG',
      locale,
    }),
    downloadCSV: localize({
      key: 'highcharts.downloadCSV',
      locale,
    }),
    downloadXLS: localize({
      key: 'highcharts.downloadXLS',
      locale,
    }),
    chartContainerLabel: localize({
      key: 'highcharts.chartContainerLabel',
      locale,
    }),
    chartMenuLabel: localize({
      key: 'highcharts.chartMenuLabel',
      locale,
    }),
    menuButtonLabel: localize({
      key: 'highcharts.menuButtonLabel',
      locale,
    }),
    beforeRegionLabel: localize({
      key: 'highcharts.beforeRegionLabel',
      locale,
    }),
    legendItem: localize({
      key: 'highcharts.legendItem',
      locale,
    }),
    legendLabel: localize({
      key: 'highcharts.legendLabel',
      locale,
    }),
    legendLabelNoTitle: localize({
      key: 'highcharts.legendLabelNoTitle',
      locale,
    }),
    close: localize({
      key: 'close',
      locale,
    }),
  }
}
