import * as util from '/lib/util'
import * as klass from '/lib/klass'
import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'
import * as thymeleaf from '/lib/thymeleaf'

const view = resolve('./highchart.html')

exports.get = function(req) {
  const part = portal.getComponent()
  const highchartIds = part.config.highchart ? util.data.forceArray(part.config.highchart) : []
  return renderPart(req, highchartIds)
}

exports.preview = (req, id) => renderPart(req, [id])

function renderPart(req, highchartIds) {
  const highcharts = []
  const municipality = klass.getMunicipality(req) ? klass.getMunicipality(req) : { code: '' }

  highchartIds.forEach((key) => {
    const highchart = content.get({ key });
    let json;
    if (highchart && highchart.data.dataquery) {
      // We assume dataset is produced
      const dataset = content.query({
        contentTypes: [`${app.name}:dataset`],
        query: `data.dataquery = '${highchart.data.dataquery}'`
      }).hits[0]
      // try to parse json from dataset
      if (dataset && dataset.data && dataset.data.json) {
        try {
          json = JSON.parse(dataset.data.json)
        } catch (e) {
          log.error('Could not parse json from dataset');
          log.error(e);
        }
      }
    }
    const highchartItem = initHighchart(highchart, json)
    highcharts.push(highchartItem)
  })

  const model = { highcharts, municipality }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}

function initHighchart(highchart, json) {
  const tableRegex = /<table[^>]*>/igm
  const nbspRegexp = /&nbsp;/igm
  const replace = '<table id="highcharts-datatable-' + highchart._id + '">'
  const resultWithId = highchart.data.htmltabell && highchart.data.htmltabell.replace(tableRegex, replace)
  const resultWithoutNbsp = resultWithId && resultWithId.replace(nbspRegexp, '')

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
