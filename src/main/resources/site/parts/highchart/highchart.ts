import { Request, Response } from 'enonic-types/lib/controller'
import { Component, PortalLibrary } from 'enonic-types/lib/portal'
import { ContentLibrary, Content } from 'enonic-types/lib/content'
import { ThymeleafLibrary, ResourceKey } from 'enonic-types/lib/thymeleaf'
import { HighchartPartConfig } from './highchart-part-config'
import { Highchart } from '../../content-types/highchart/highchart'
import { Dataset } from '../../content-types/dataset/dataset'
import { UtilLibrary } from '../../../lib/types/util'
import { MunicipalitiesLib, MunicipalityWithCounty } from '../../../lib/klass/municipalities'
const util: UtilLibrary = __non_webpack_require__( '/lib/util')
const { getMunicipality }: MunicipalitiesLib = __non_webpack_require__( '/lib/klass/municipalities')
const portal: PortalLibrary = __non_webpack_require__( '/lib/xp/portal')
const content: ContentLibrary = __non_webpack_require__( '/lib/xp/content')
const thymeleaf: ThymeleafLibrary = __non_webpack_require__( '/lib/thymeleaf')

const view: ResourceKey = resolve('./highchart.html')


export function get (req: Request): Response {
  const part: Component<HighchartPartConfig> | null = portal.getComponent()
  let highchartIds: Array<string> = []
  if (part) {
    highchartIds = part.config.highchart ? util.data.forceArray(part.config.highchart) as Array<string> : []
  }
  return renderPart(req, highchartIds)
}

export function preview (req: Request, id: string): Response {
  return renderPart(req, [id])
}

function renderPart (req: Request, highchartIds: Array<string>): Response {
  const highcharts: Array<HighchartOptions> = []
  const municipality: MunicipalityWithCounty | undefined = getMunicipality(req) ? getMunicipality(req) : { code: '' } as MunicipalityWithCounty

  highchartIds.forEach((key) => {
    const highchart: Content<Highchart> | null = content.get({ key })
    let json: string | null = null
    if (highchart && highchart.data.dataquery) {
      // We assume dataset is produced
      const dataset: Content<Dataset> = content.query({
        count: 1,
        contentTypes: [`${app.name}:dataset`],
        query: `data.dataquery = '${highchart.data.dataquery}'`
      }).hits[0] as Content<Dataset>
      // try to parse json from dataset
      if (dataset && dataset.data && dataset.data.json) {
        try {
          json = JSON.parse(dataset.data.json)
        } catch (e) {
          log.error('Could not parse json from dataset')
          log.error(e)
        }
      }
      const highchartItem: HighchartOptions = initHighchart(highchart, json)
      highcharts.push(highchartItem)
    }
  })

  const model: HighchartsViewModel = { highcharts, municipality }
  const body: string = thymeleaf.render(view, model)

  return {
    status: 200,
    body,
    contentType: 'text/html'
  }
}

function initHighchart (highchart: Content<Highchart>, json: string | null): HighchartOptions {
  const tableRegex: RegExp = /<table[^>]*>/igm
  const nbspRegexp: RegExp = /&nbsp;/igm
  const replace: string = '<table id="highcharts-datatable-' + highchart._id + '">'
  const resultWithId: string | undefined = highchart.data.htmltabell && highchart.data.htmltabell.replace(tableRegex, replace)
  const resultWithoutNbsp: string | undefined = resultWithId && resultWithId.replace(nbspRegexp, '')

  return {
    json,
    tableData: resultWithoutNbsp,
    contentkey: highchart._id,
    type: highchart.data.type,
    zoomtype: highchart.data.zoomtype ? highchart.data.zoomtype : null,
    creditsenabled: (highchart.data.kildeurl || highchart.data.kildetekst) ? true : false,
    creditshref: highchart.data.kildeurl,
    creditstext: highchart.data.kildetekst,
    switchrowsandcolumns: highchart.data.byttraderogkolonner,
    combineinformation: highchart.data.combineInfo ? true : false,
    tickinterval: highchart.data.tickinterval ? highchart.data.tickinterval.replace(/,/g, '.') : null,
    legendenabled: highchart.data.nolegend ? false : true,
    plotoptionsseriesstacking: (highchart.data.stabling == 'normal' || highchart.data.stabling == 'percent') ? highchart.data.stabling : null,
    subtitletext: highchart.data.undertittel,
    title: highchart.displayName,
    xaxisallowdecimals: highchart.data.xAllowDecimal ? true : false,
    xaxislabelsenabled: highchart.data.xEnableLabel ? false : true,
    xaxismax: highchart.data.xAxisMax ? highchart.data.xAxisMax.replace(/,/g, '.') : null,
    xaxismin: highchart.data.xAxisMin ? highchart.data.xAxisMin.replace(/,/g, '.') : null,
    xaxistitletext: highchart.data.xAxisTitle,
    xaxistype: highchart.data.xAxisType ? highchart.data.xAxisType : 'categories',
    yaxisallowdecimals: highchart.data.yAxisAllowDecimal ? true : false,
    yaxismax: highchart.data.yAxisMax ? highchart.data.yAxisMax.replace(/,/g, '.') : null,
    yaxismin: highchart.data.yAxisMin ? highchart.data.yAxisMin.replace(/,/g, '.') : null,
    yaxistitletext: highchart.data.yAxisTitle,
    yaxistype: highchart.data.yAxisType ? highchart.data.yAxisType : 'linear',
    yaxisstacklabelsenabled: highchart.data.stabelsum ? true : false,
    titleCenter: highchart.data.titleCenter ? 'center' : 'left',
    numberdecimals: highchart.data.numberdecimals,
    bottomSpace: highchart.data.fotnoteTekst ? '122' : '22',
    pieLegendUnder: highchart.data['pie-legend'] ? 'under' : false,
    fotnoteTekst: highchart.data.fotnoteTekst,
    legendAlign: (highchart.data.legendAlign === 'right') ? 'right' : 'center'
  }
}

interface HighchartsViewModel {
  highcharts: Array<HighchartOptions>;
  municipality: MunicipalityWithCounty | undefined;
}

interface HighchartOptions {
  json: string | null;
  tableData?: string;
  contentkey: string;
  type?: string;
  zoomtype: string | null;
  creditsenabled: boolean;
  creditshref?: string;
  creditstext?: string;
  switchrowsandcolumns: boolean;
  combineinformation: boolean;
  tickinterval: string | null;
  legendenabled: boolean;
  plotoptionsseriesstacking: string | null;
  subtitletext?: string;
  title: string;
  xaxisallowdecimals: boolean;
  xaxislabelsenabled: boolean;
  xaxismax: string | null;
  xaxismin: string | null;
  xaxistitletext?: string;
  xaxistype: string;
  yaxisallowdecimals: boolean;
  yaxismax: string | null;
  yaxismin: string | null;
  yaxistitletext?: string;
  yaxistype: string;
  yaxisstacklabelsenabled: boolean;
  titleCenter: string;
  numberdecimals?: string;
  bottomSpace: string;
  pieLegendUnder: string | boolean;
  fotnoteTekst?: string;
  legendAlign: string;
}
