import * as util from '/lib/util'
import * as klass from '/lib/klass'
import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'
import * as thymeleaf from '/lib/thymeleaf'

function initHighchart(part) {
  const _content = part.chart
  const tableRegex = /<table[^>]*>/igm
  const nbspRegexp = /&nbsp;/igm
  const replace = '<table id="highcharts-datatable-' + _content._id + '">'
  const resultWithId = _content.data.htmltabell && _content.data.htmltabell.replace(tableRegex, replace)
  const resultWithoutNbsp = resultWithId && resultWithId.replace(nbspRegexp, '')

  part.chart.tableData = resultWithoutNbsp
  part.chart.contentkey = _content._id
  part.chart.type = _content.data.type
  part.chart.zoomtype = _content.data.zoomtype ? _content.data.zoomtype : null
  part.chart.creditsenabled = (_content.data.kildeurl || _content.data.kildetekst) ? true : false
  part.chart.creditshref = _content.data.kildeurl
  part.chart.creditstext = _content.data.kildetekst
  part.chart.switchrowsandcolumns = _content.data.byttraderogkolonner
  part.chart.combineinformation = _content.data.combineInfo ? true : false
  part.chart.tickinterval = _content.data.tickinterval ? _content.data.tickinterval.replace(/,/g, '.') : null
  part.chart.legendenabled = _content.data.nolegend ? false : true
  part.chart.plotoptionsseriesstacking = (_content.data.stabling == 'normal' || _content.data.stabling == 'percent') ? _content.data.stabling : null
  part.chart.subtitletext = _content.data.undertittel
  part.chart.title = _content.displayName
  part.chart.xaxisallowdecimals = _content.data.xAllowDecimal ? true : false
  part.chart.xaxislabelsenabled = _content.data.xEnableLabel ? false : true
  part.chart.xaxismax = _content.data.xAxisMax ? _content.data.xAxisMax.replace(/,/g, '.') : null
  part.chart.xaxismin = _content.data.xAxisMin ? _content.data.xAxisMin.replace(/,/g, '.') : null
  part.chart.xaxistitletext = _content.data.xAxisTitle
  part.chart.xaxistype = _content.data.xAxisType ? _content.data.xAxisType : 'categories'
  part.chart.yaxisallowdecimals = _content.data.yAxisAllowDecimal ? true : false
  part.chart.yaxismax = _content.data.yAxisMax ? _content.data.yAxisMax.replace(/,/g, '.') : null
  part.chart.yaxismin = _content.data.yAxisMin ? _content.data.yAxisMin.replace(/,/g, '.') : null
  part.chart.yaxistitletext = _content.data.yAxisTitle
  part.chart.yaxistype = _content.data.yAxisType ? _content.data.yAxisType : 'linear'
  part.chart.yaxisstacklabelsenabled = _content.data.stabelsum ? true : false
  part.chart.titleCenter = _content.data.titleCenter ? 'center' : 'left'
  part.chart.numberdecimals = _content.data.numberdecimals
  part.chart.bottomSpace = _content.data.fotnoteTekst ? '122' : '22'
  part.chart.pieLegendUnder = _content.data['pie-legend'] ? 'under' : false
  part.chart.fotnoteTekst = _content.data.fotnoteTekst,
  part.chart.legendAlign = (_content.data.legendAlign=='right') ? 'right' : 'center'
}

exports.get = function(req) {
  const part = portal.getComponent() || req
  const view = resolve('./highchart.html')
  const highcharts = []
  let json

// log.info(JSON.stringify(part, null, ' '))

  const municipality = klass.getMunicipality(req)

  part.config.highchart = part.config.highchart && util.data.forceArray(part.config.highchart) || []
  part.config.highchart.map((key) => {
    const highchart = { chart: content.get({ key }) }
    if (highchart && highchart.chart.data.dataquery) {
      // We assume dataset is produced
      const datasets = content.query({ contentTypes: [`${app.name}:dataset`], query: `data.dataquery = '${highchart.chart.data.dataquery}'` })
      const dataset = datasets && datasets.total && datasets.hits[0]
      json = dataset && JSON.parse(dataset.data.json)
    }
    highcharts.push(highchart)
    initHighchart(highchart)
  })

// log.info(JSON.stringify(part, null, ' '))

  const model = { part, highcharts, json, municipality }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
