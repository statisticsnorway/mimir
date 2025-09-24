/* eslint-disable @typescript-eslint/no-require-imports */
import React, { useEffect, useRef } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import PropTypes from 'prop-types'
import { Link, Text, Tabs, Divider } from '@statisticsnorway/ssb-component-library'
import { Col, Row } from 'react-bootstrap'
import { useMediaQuery } from 'react-responsive'

import { exportHighchartsToExcel } from '/lib/ssb/utils/tableExportUtils'
import accessibilityLang from './../../../assets/js/highchart-lang.json'

if (typeof Highcharts === 'object') {
  require('highcharts/modules/accessibility')(Highcharts)
  require('highcharts/modules/exporting')(Highcharts)
  require('highcharts/modules/offline-exporting')(Highcharts)
  require('highcharts/modules/export-data')(Highcharts)
  require('highcharts/modules/map')(Highcharts)
}

function generateColors(color, thresholdValues) {
  const obj = {}

  if (!color?._selected || color?._selected === 'green') {
    obj.colors = ['#e3f1e6', '#90cc93', '#25a23c', '#007e50', '#005245']
  }

  if (thresholdValues.length > 0) {
    obj.colorAxis = {
      dataClasses: thresholdValues,
      // 'category' uses colors field, tween uses minColor and maxColor
      dataClassColor: color?._selected === 'gradient' ? 'tween' : 'category',
    }
  }

  // colorAxis only works if we have numerical values, so wont work with data like Red: Oslo, Blue: Bergen etc
  if (color?._selected === 'gradient') {
    obj.colorAxis = obj.colorAxis || {}
    obj.colorAxis.minColor = color.gradient.startColor
    obj.colorAxis.maxColor = color.gradient.endColor
    if (color.gradient.stops) {
      if (!Array.isArray(color.gradient.stops)) color.gradient.stops = [color.gradient.stops]

      obj.colorAxis.stops = [
        [0, color.gradient.startColor],
        ...color.gradient.stops.map((stop) => [stop.value.replace(',', '.'), stop.color]),
        [1, color.gradient.endColor],
      ]
    }
  }

  return obj
}

function isNumeric(value) {
  if (typeof value === 'number') return true
  if (typeof value != 'string') return false
  return (
    !isNaN(value) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(value))
  ) // ...and ensure strings of whitespace fail
}

function generateSeries(tableData, mapDataSecondColumn, color) {
  const dataSeries = tableData.reduce((acc, [name, value]) => {
    if (!acc[name]) {
      acc[name] = [value]
    } else {
      acc[name].push(value)
    }
    return acc
  }, {})

  let definedColors
  if (color?._selected === 'defined') {
    if (!Array.isArray(color.defined.colorSerie)) color.defined.colorSerie = [color.defined.colorSerie]

    definedColors = color.defined.colorSerie.reduce((acc, color) => {
      if (!color.serie || !color.color) return acc

      acc[color.serie] = color.color
      return acc
    }, {})
  }

  const series = [
    {
      // dummy series to show outline of all areas
      allAreas: true,
      showInLegend: false,
      opacity: 1,
    },
    ...Object.entries(dataSeries).map(([name, values]) => {
      return {
        name: String(name),
        color: definedColors ? definedColors[name] : undefined,
        data: values.map((value) => ({
          capitalName: mapDataSecondColumn ? String(value).toUpperCase() : String(name).toUpperCase(),
          code: value,
          value: isNumeric(value) ? value : undefined,
        })),
      }
    }),
  ]
  return series
}

const getPointFormatter = (language, hasThreshhold, legendTitle) =>
  function () {
    const value = language !== 'en' ? String(this.value).replace('.', ',') : this.value
    if (!hasThreshhold) {
      return this.properties.name
    }
    return `${legendTitle ? legendTitle + ': ' : ''}${value}`
  }

const chart = (desktop, heightAspectRatio, mapFile) => {
  return {
    height: desktop && heightAspectRatio && `${heightAspectRatio}%`,
    style: {
      color: '#21383a',
      fontSize: '14px',
      fontWeight: 'normal',
      fontFamily: '"Open Sans Regular", "Arial", "DejaVu Sans", sans-serif',
    },
    map: mapFile,
  }
}

const legend = (desktop, legendTitle, legendAlign, numberDecimals) => {
  let y = 0
  if (legendAlign === 'topLeft') {
    y = desktop ? 120 : 165
  }

  if (legendAlign === 'topRight') {
    y = desktop ? 40 : 95
  }

  return {
    title: {
      text: legendTitle,
      style: {
        color: Highcharts.theme?.textColor || 'black',
      },
    },
    align: legendAlign === 'topLeft' || legendAlign === 'bottomLeft' ? 'left' : 'right',
    verticalAlign: legendAlign === 'topLeft' || legendAlign === 'topRight' ? 'top' : 'bottom',
    floating: true,
    layout: 'vertical',
    x: 0,
    y,
    valueDecimals: numberDecimals,
    backgroundColor: Highcharts.theme?.legendBackgroundColor || 'rgba(255, 255, 255, 0.85)',
    symbolRadius: 0,
  }
}

export const downloadAsXLSX = (title) =>
  function () {
    const rows = this.getDataRows(true)
    exportHighchartsToExcel({
      rows: rows.slice(1),
      fileName: title ? `${title}.xlsx` : 'graf.xlsx',
    })
  }

const exporting = (sourceList, phrases, title) => {
  return {
    chartOptions: {
      chart: {
        spacingBottom: 30 + (sourceList ? sourceList.length * 30 : 0),
      },
      credits: {
        enabled: !!sourceList,
        text: sourceList?.reduce((combinedSources, currentSource) => {
          return combinedSources + `<b style="color:#274247">${phrases.source}: </b>${currentSource.sourceText}</br>`
        }, ''),
        position: {
          align: 'left',
          x: 10,
          y: -20 - (sourceList ? sourceList.length * 20 : 0),
        },
        style: {
          color: '#00824d',
          fontSize: '16px',
        },
      },
    },
    buttons: {
      contextButton: {
        symbol: 'menu',
        symbolStroke: '#00824D', // ssb-green-4
        text: phrases['highcharts.download'],
        menuItems: [
          'printChart',
          'separator',
          'downloadPNG',
          'downloadJPEG',
          'downloadPDF',
          'downloadSVG',
          'separator',
          'downloadCSV',
          'downloadXLS',
        ],
      },
    },
    enabled: true,
    menuItemDefinitions: {
      printChart: {
        text: phrases['highcharts.printChart'],
      },
      downloadPNG: {
        text: phrases['highcharts.downloadPNG'],
      },
      downloadJPEG: {
        text: phrases['highcharts.downloadJPEG'],
      },
      downloadPDF: {
        text: phrases['highcharts.downloadPDF'],
      },
      downloadSVG: {
        text: phrases['highcharts.downloadSVG'],
      },
      downloadCSV: {
        text: phrases['highcharts.downloadCSV'],
      },
      downloadXLS: {
        text: phrases['highcharts.downloadXLS'],
        onclick: downloadAsXLSX(title),
      },
    },
    showTable: true,
    allowTableSorting: false
  }
}

const plotOptions = (hasThreshhold, hideTitle, language, legendTitle, numberDecimals) => {
  return {
    map: {
      allAreas: false,
      joinBy: 'capitalName',
      dataLabels: {
        enabled: !hideTitle,
        format: '{point.properties.name}',
      },
      tooltip: {
        pointFormatter: getPointFormatter(language, hasThreshhold, legendTitle),
        valueDecimals: numberDecimals,
      },
    },
  }
}

function Highmap(props) {
  const {
    heightAspectRatio,
    mapFile,
    legendAlign,
    thresholdValues,
    tableData,
    mapDataSecondColumn,
    color,
    description,
    title,
    subtitle,
    hideTitle,
    language,
    legendTitle,
    numberDecimals,
    sourceList,
    phrases,
    footnoteText,
    highmapId
  } = props

  const highmapsWrapperRef = useRef(null)

  useEffect(() => {
    const highmapWrapperElement = highmapsWrapperRef.current?.children
    const [highmapElement, tableWrapperElement] = highmapWrapperElement ?? []
    const tableElement = tableWrapperElement?.children[0]

    tableWrapperElement?.classList.add('ssb-table-wrapper', 'd-none')
    tableElement?.classList.add('statistics', 'ssb-table')

    // Add Tab component accessibility tags for Highmaps and table
    highmapElement?.setAttribute('id', 'tabpanel-0-' + highmapId)
    highmapElement?.setAttribute('role', 'tabpanel')

    tableWrapperElement?.setAttribute('id', 'tabpanel-1-' + highmapId)
    tableWrapperElement?.setAttribute('role', 'tabpanel')
  }, [])

  const desktop = useMediaQuery({
    minWidth: 992,
  })

  const hasThreshhold = thresholdValues.length > 0
  const series = generateSeries(tableData, mapDataSecondColumn, color)

  const mapOptions = {
    chart: chart(desktop, heightAspectRatio, mapFile),
    accessibility: {
      enabled: true,
      description,
    },
    ...accessibilityLang,
    title: {
      text: title,
      align: 'left',
    },
    subtitle: {
      text: subtitle,
      align: 'left',
    },
    mapNavigation: {
      enabled: true,
    },
    ...generateColors(color, thresholdValues),
    legend: legend(desktop, legendTitle, legendAlign, numberDecimals),
    plotOptions: plotOptions(hasThreshhold, hideTitle, language, legendTitle, numberDecimals),
    series,
    credits: {
      enabled: false,
    },
    exporting: exporting(sourceList, phrases, title),
    csv: {
      itemDelimiter: ';',
    },
  }

  const handleTabOnClick = (item) => {
    const showTable = item === 'show-as-table'

    const highmapWrapperElement = highmapsWrapperRef.current?.children
    const [highmapElement, tableWrapperElement] = highmapWrapperElement ?? []

    tableWrapperElement?.classList.toggle('d-none', !showTable)
    tableWrapperElement?.setAttribute('aria-hidden', !showTable)
    highmapElement?.classList.toggle('d-none', showTable)
    highmapElement?.setAttribute('aria-hidden', showTable)
  }

  function renderShowAsFigureOrTableTab() {
    return (
      <>
        <Tabs
        id={highmapId}
        activeOnInit="show-as-chart"
        items={[
          {title: phrases['highcharts.showAsChart'], path: 'show-as-chart'},
          {title: phrases['highcharts.showAsTable'], path: 'show-as-table'}
        ]}
        onClick={handleTabOnClick}
        />
        <Divider className='mb-3' />
      </>
    )
  }

  function renderHighchartsSource(sourceLink, index) {
    return (
      <div key={index} className='mt-3'>
        <Link className='ssb-link stand-alone' href={sourceLink.sourceHref}>
          {phrases.source}: {sourceLink.sourceText}
        </Link>
      </div>
    )
  }

  return (
    <Row>
      <Col className='col-12'>
        <figure id={`figure-${highmapId}`} className='highcharts-figure mb-0 hide-title'>
          {mapOptions.title?.text && <figcaption className='figure-title'>{mapOptions.title.text}</figcaption>}
          {mapOptions.subtitle?.text && <p className='figure-subtitle'>{mapOptions.subtitle.text}</p>}
          {renderShowAsFigureOrTableTab()}
          <div ref={highmapsWrapperRef}>
            <HighchartsReact
              highcharts={Highcharts}
              constructorType='mapChart'
              options={mapOptions}
            />
          </div>
        </figure>
        {footnoteText?.map((footnote) => (
          <Col className='footnote col-12' key={`footnote-${footnote}`}>
            {footnote && <Text>{footnote}</Text>}
          </Col>
        ))}
        {sourceList?.map(renderHighchartsSource)}
      </Col>
    </Row>
  )
}

Highmap.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  description: PropTypes.string,
  mapFile: PropTypes.string,
  tableData: PropTypes.array,
  mapDataSecondColumn: PropTypes.bool,
  style: PropTypes.object,
  thresholdValues: PropTypes.array,
  hideTitle: PropTypes.bool,
  color: PropTypes.object,
  numberDecimals: PropTypes.string,
  heightAspectRatio: PropTypes.string,
  seriesTitle: PropTypes.string,
  legendTitle: PropTypes.string,
  legendAlign: PropTypes.string,
  sourceList: PropTypes.array,
  footnoteText: PropTypes.array,
  phrases: PropTypes.object,
  language: PropTypes.string,
  highmapId: PropTypes.string
}

export default (props) => <Highmap {...props} />
