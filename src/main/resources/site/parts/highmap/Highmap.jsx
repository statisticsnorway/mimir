import React, { useEffect } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import PropTypes from 'prop-types'
import { Link, Text } from '@statisticsnorway/ssb-component-library'
import { Col, Row } from 'react-bootstrap'
import { useMediaQuery } from 'react-responsive'

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
    obj.colorAxis.minColor = color.gradient.color1
    obj.colorAxis.maxColor = color.gradient.color2
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

function Highmap(props) {
  useEffect(() => {
    if (props.language !== 'en') {
      Highcharts.setOptions({
        lang: {
          decimalPoint: ',',
          thousandsSep: ' ',
        },
      })
    }
  }, [])

  const desktop = useMediaQuery({
    minWidth: 992,
  })

  let y = 0
  if (props.legendAlign === 'topLeft') {
    y = desktop ? 120 : 165
  }

  if (props.legendAlign === 'topRight') {
    y = desktop ? 40 : 95
  }

  const hasThreshhold = props.thresholdValues.length > 0
  const series = generateSeries(props.tableData, props.mapDataSecondColumn, props.color)

  const mapOptions = {
    chart: {
      height: desktop && props.heightAspectRatio && `${props.heightAspectRatio}%`,
      style: {
        color: '#21383a',
        fontSize: '14px',
        fontWeight: 'normal',
        fontFamily: '"Open Sans Regular", "Arial", "DejaVu Sans", sans-serif',
      },
      map: props.mapFile,
    },
    accessibility: {
      enabled: true,
      description: props.description,
    },
    ...accessibilityLang,
    title: {
      text: props.title,
      align: 'left',
    },
    subtitle: {
      text: props.subtitle,
      align: 'left',
    },
    mapNavigation: {
      enabled: true,
    },
    ...generateColors(props.color, props.thresholdValues),
    legend: {
      title: {
        text: props.legendTitle,
        style: {
          color: Highcharts.theme?.textColor || 'black',
        },
      },
      align: props.legendAlign === 'topLeft' || props.legendAlign === 'bottomLeft' ? 'left' : 'right',
      verticalAlign: props.legendAlign === 'topLeft' || props.legendAlign === 'topRight' ? 'top' : 'bottom',
      floating: true,
      layout: 'vertical',
      x: 0,
      y,
      valueDecimals: props.numberDecimals,
      backgroundColor: Highcharts.theme?.legendBackgroundColor || 'rgba(255, 255, 255, 0.85)',
      symbolRadius: 0,
      symbolHeight: 14,
    },
    plotOptions: {
      map: {
        allAreas: false,
        joinBy: 'capitalName',
        dataLabels: {
          enabled: !props.hideTitle,
          format: '{point.properties.name}',
        },
        tooltip: {
          pointFormat: !hasThreshhold
            ? '{point.properties.name}'
            : props.legendTitle
              ? `${props.legendTitle}: {point.code}`
              : '{point.code}',
          valueDecimals: props.numberDecimals,
        },
      },
    },
    series,
    credits: {
      enabled: false,
    },
    exporting: {
      buttons: {
        contextButton: {
          symbol: 'menu',
          symbolStroke: '#00824D', // ssb-green-4
          text: props.phrases['highcharts.download'],
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
          text: props.phrases['highcharts.printChart'],
        },
        downloadPNG: {
          text: props.phrases['highcharts.downloadPNG'],
        },
        downloadJPEG: {
          text: props.phrases['highcharts.downloadJPEG'],
        },
        downloadPDF: {
          text: props.phrases['highcharts.downloadPDF'],
        },
        downloadSVG: {
          text: props.phrases['highcharts.downloadSVG'],
        },
        downloadCSV: {
          text: props.phrases['highcharts.downloadCSV'],
        },
        downloadXLS: {
          text: props.phrases['highcharts.downloadXLS'],
        },
      },
    },
    csv: {
      itemDelimiter: ';',
    },
  }

  function renderHighchartsSource(sourceLink, index) {
    return (
      <div key={index} className='mt-3'>
        <Link className='ssb-link stand-alone' href={sourceLink.sourceHref}>
          {props.phrases.source}: {sourceLink.sourceText}
        </Link>
      </div>
    )
  }

  return (
    <section className='xp-part highchart-wrapper'>
      <Row>
        <Col className='col-12'>
          <figure className='highcharts-figure mb-0 hide-title'>
            {mapOptions.title?.text && <figcaption className='figure-title'>{mapOptions.title.text}</figcaption>}
            {mapOptions.subtitle?.text && <p className='figure-subtitle'>{mapOptions.subtitle.text}</p>}
            <HighchartsReact highcharts={Highcharts} constructorType={'mapChart'} options={mapOptions} />
          </figure>
          {props.footnoteText &&
            props.footnoteText.map((footnote) => (
              <Col className='footnote col-12' key={`footnote-${footnote}`}>
                {footnote && <Text>{footnote}</Text>}
              </Col>
            ))}
          {props.sourceList && props.sourceList.map(renderHighchartsSource)}
        </Col>
      </Row>
    </section>
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
  hideTitle: PropTypes.boolean,
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
}

export default (props) => <Highmap {...props} />
