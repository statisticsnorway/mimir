import React, { useEffect, useRef } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import PropTypes from 'prop-types'
import { Link, Text, Tabs, Divider } from '@statisticsnorway/ssb-component-library'
import { Col, Row } from 'react-bootstrap'
import { useMediaQuery } from 'react-responsive'
import 'highcharts/modules/accessibility'
import 'highcharts/modules/exporting'
import 'highcharts/modules/offline-exporting'
import 'highcharts/modules/export-data'
import 'highcharts/modules/map'

import { exportHighchartsToExcel } from '/lib/ssb/utils/tableExportUtils'
import accessibilityLang from './../../../assets/js/highchart-lang.json'

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

function generateSeries(tableData, mapDataSecondColumn, color, seriesTitle, phrases) {
  const mapUsingDefinedValues = color?._selected === 'defined'
  const dataSeriesTitle = seriesTitle ?? phrases['highmaps.seriesTitle']
  let plotSeriesForDiscreteValues = {}
  let definedColors

  if (mapUsingDefinedValues) {
    plotSeriesForDiscreteValues = tableData.reduce((acc, [name, value]) => {
      if (!acc[name]) {
        acc[name] = [value]
      } else {
        acc[name].push(value)
      }
      return acc
    }, {})

    if (!Array.isArray(color.defined.colorSerie)) color.defined.colorSerie = [color.defined.colorSerie]

    definedColors = color.defined.colorSerie.reduce((acc, color) => {
      if (!color.serie || !color.color) return acc

      acc[color.serie] = color.color
      return acc
    }, {})
  }

  let dataSeries = tableData.map(([name, value]) => {
    return {
      capitalName: mapDataSecondColumn ? String(value).toUpperCase() : String(name).toUpperCase(),
      color: definedColors?.[name],
      name: mapDataSecondColumn ? value : name,
      value: mapDataSecondColumn ? name : value,
    }
  })

  const series = [
    {
      // dummy series to show outline of all areas
      allAreas: true,
      showInLegend: false,
      opacity: 1,
      includeInDataExport: false,
    },
    // For datasets with defined colors (ie. not numeric values) this series is only used for exporting/table
    {
      data: dataSeries,
      joinBy: 'capitalName',
      name: dataSeriesTitle,
      showInLegend: false,
      opacity: !mapUsingDefinedValues ? 1 : 0,
    },
    // For datasets with defined colors (ie. not numeric values) these series are plotted
    ...Object.keys(plotSeriesForDiscreteValues).map((key) => {
      return {
        showInLegend: true,
        includeInDataExport: false,
        name: key,
        color: definedColors?.[key],
        data: plotSeriesForDiscreteValues[key].map((value) => ({
          capitalName: mapDataSecondColumn ? String(value).toUpperCase() : String(key).toUpperCase(),
          code: value,
          value: '', // value is required even though this series only does coloring areas
        })),
      }
    }),
  ]
  return series
}

const getTooltipFormatter = (language, seriesTitle) =>
  function () {
    if (this.point.value || this.point.value === 0) {
      const value = language !== 'en' ? String(this.point.value).replace('.', ',') : this.point.value
      return `${this.point.name}</br>${seriesTitle ? seriesTitle + ': ' : ''}${value}`
    }
    return `${this.point.name}</br>${this.series.name}`
  }

const chart = (desktop, heightAspectRatio, mapFile, language) => {
  return {
    height: desktop && heightAspectRatio && `${heightAspectRatio}%`,
    style: {
      color: '#21383a',
      fontSize: '14px',
      fontWeight: 'normal',
      fontFamily: '"Open Sans Regular", "Arial", "DejaVu Sans", sans-serif',
    },
    map: mapFile,
    events: {
      // Workaround to get correct number formatting in table in Norwegian
      exportData: function (chart) {
        const rows = chart.dataRows
        for (const row of chart.dataRows) {
          // Escaping first vaule not to format category ie. year
          for (const [i, cell] of row.entries()) {
            if (i > 0 && typeof cell === 'number') {
              const cellValue = cell.toLocaleString(language === 'en' ? 'en-EN' : 'no-NO').replace('NaN', '')
              row[i] = language === 'en' ? cellValue.replace(/,/g, ' ') : cellValue
            }
          }
        }
      },
    },
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
    },
    itemStyle: {
      fontWeight: 'bold',
      color: Highcharts.theme?.textColor || 'black',
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
      downloadXLS: {
        onclick: downloadAsXLSX(title),
      },
    },
    showTable: true,
    allowTableSorting: false,
  }
}

const plotOptions = (hideTitle) => {
  return {
    map: {
      allAreas: false,
      joinBy: 'capitalName',
      dataLabels: {
        enabled: !hideTitle,
        format: '{point.properties.name}',
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
    highmapId,
    geographicalCategory,
    seriesTitle,
  } = props

  const highmapsWrapperRef = useRef(null)

  useEffect(() => {
    const highmapWrapperElement = highmapsWrapperRef.current?.children
    const [highmapElement, tableWrapperElement] = highmapWrapperElement ?? []
    const tableElement = tableWrapperElement?.children[0]

    tableWrapperElement?.classList.add('ssb-table-wrapper', 'd-none')
    tableElement?.classList.add('statistics', 'ssb-table')
    tableElement?.setAttribute('tabindex', '0') // Scrollable region must have keyboard access

    // Add Tab component accessibility tags for Highmaps and table
    highmapElement?.setAttribute('id', 'tabpanel-0-' + highmapId)
    highmapElement?.setAttribute('role', 'tabpanel')

    tableWrapperElement?.setAttribute('id', 'tabpanel-1-' + highmapId)
    tableWrapperElement?.setAttribute('role', 'tabpanel')
  }, [])

  const desktop = useMediaQuery({
    minWidth: 992,
  })

  const lang = language !== 'en' ? accessibilityLang.lang : {}

  const mapOptions = {
    chart: chart(desktop, heightAspectRatio, mapFile, language),
    accessibility: {
      enabled: true,
      description,
    },
    lang: {
      ...lang,
      exportData: {
        categoryHeader: geographicalCategory ?? phrases['highmaps.geographicalCategory'],
      },
    },
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
    plotOptions: plotOptions(hideTitle),
    series: generateSeries(tableData, mapDataSecondColumn, color, seriesTitle, phrases),
    tooltip: {
      enabled: true,
      formatter: getTooltipFormatter(language, seriesTitle),
      valueDecimals: numberDecimals,
    },
    credits: {
      enabled: false,
    },
    exporting: exporting(sourceList, phrases, title),
    csv: {
      itemDelimiter: ';',
      decimalPoint: language === 'en' ? '.' : ',',
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
          activeOnInit='show-as-chart'
          items={[
            { title: phrases['highcharts.showAsChart'], path: 'show-as-chart' },
            { title: phrases['highcharts.showAsTable'], path: 'show-as-table' },
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
            <HighchartsReact highcharts={Highcharts} constructorType='mapChart' options={mapOptions} />
          </div>
        </figure>
        {footnoteText?.map((footnote) => (
          <Col className='footnote col-12' key={`footnote-${footnote}`}>
            {footnote && <Text small='true'>{footnote}</Text>}
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
  highmapId: PropTypes.string,
  geographicalCategory: PropTypes.String,
}

export default (props) => <Highmap {...props} />
