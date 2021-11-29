import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import PropTypes from 'prop-types'
import { Text } from '@statisticsnorway/ssb-component-library'
import { Col, Row } from 'react-bootstrap'
import { useMediaQuery } from 'react-responsive'

require('highcharts/modules/accessibility')(Highcharts)
require('highcharts/modules/exporting')(Highcharts)
require('highcharts/modules/export-data')(Highcharts)
require('highcharts/modules/map')(Highcharts)

function renderFootnotes(footnotes) {
  if (footnotes.length) {
    return (
      <Row>
        {footnotes.map((footnote, index) =>
          <Col className="col-12" key={`footnote-${index}`}>
            {footnote && <Text>{footnote}</Text>}
          </Col>)}
      </Row>
    )
  }
  return
}

function Highmap(props) {
  if (props.language !== 'en') {
    Highcharts.setOptions({
      lang: {
        decimalPoint: ',',
        thousandsSep: ' '
      }
    })
  }

  const desktop = useMediaQuery({
    minWidth: 992
  })

  let y = 0
  if (props.legendAlign === 'topLeft') {
    y = desktop ? 120 : 165
  }

  if (props.legendAlign === 'topRight') {
    y = desktop ? 40 : 95
  }

  const mapOptions = {
    chart: {
      height: desktop && props.heightAspectRatio && `${props.heightAspectRatio}%`
    },
    accessibility: {
      enabled: true,
      description: props.description && props.description
    },
    title: {
      text: props.title,
      align: 'left'
    },
    subtitle: {
      text: props.subtitle && props.subtitle,
      align: 'left'
    },
    mapNavigation: {
      enabled: true
    },
    colors: props.colorPalette === 'green' ?
      ['#e3f1e6', '#90cc93', '#25a23c', '#007e50', '#005245'] :
      ['#f9f2d1', '#e8d780', '#d2bc2a', '#a67c36', '#6e4735'],
    colorAxis: {
      dataClasses: props.thresholdValues && props.thresholdValues,
      dataClassColor: 'category'
    },
    legend: {
      title: {
        text: props.legendTitle && props.legendTitle,
        style: {
          color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
        }
      },
      align: props.legendAlign === 'topLeft' || props.legendAlign === 'bottomLeft' ? 'left' : 'right',
      verticalAlign: props.legendAlign === 'topLeft' || props.legendAlign === 'topRight' ? 'top' : 'bottom',
      floating: true,
      layout: 'vertical',
      x: 0,
      y,
      valueDecimals: props.numberDecimals && props.numberDecimals,
      backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || 'rgba(255, 255, 255, 0.85)',
      symbolRadius: 0,
      symbolHeight: 14
    },
    series: [{
      mapData: props.mapFile,
      data: props.tableData,
      name: props.seriesTitle ? props.seriesTitle : '',
      joinBy: 'capitalName',
      dataLabels: {
        enabled: !props.hideTitle,
        format: '{point.properties.name}'
      },
      tooltip: {
        pointFormat: '{point.properties.name}: {point.value}',
        valueDecimals: props.numberDecimals && props.numberDecimals
      }
    }],
    credits: {
      enabled: false
    },
    exporting: {
      buttons: {
        contextButton: {
          menuItems: [
            'printChart',
            'separator',
            'downloadPNG',
            'downloadJPEG',
            'downloadPDF',
            'downloadSVG',
            'separator',
            'downloadCSV',
            'downloadXLS'
          ]
        }
      },
      enabled: true,
      menuItemDefinitions: {
        printChart: {
          text: props.phrases['highcharts.printChart']
        },
        downloadPNG: {
          text: props.phrases['highcharts.downloadPNG']
        },
        downloadJPEG: {
          text: props.phrases['highcharts.downloadJPEG']
        },
        downloadPDF: {
          text: props.phrases['highcharts.downloadPDF']
        },
        downloadSVG: {
          text: props.phrases['highcharts.downloadSVG']
        },
        downloadCSV: {
          text: props.phrases['highcharts.downloadCSV']
        },
        downloadXLS: {
          text: props.phrases['highcharts.downloadXLS']
        }
      }
    },
    csv: {
      itemDelimiter: ';'
    }
  }

  return (
    <section className="part-highmap container">
      <Row>
        <Col className="col-12 p-lg-0">
          <HighchartsReact
            highcharts={Highcharts}
            constructorType={'mapChart'}
            options={mapOptions}
          />
        </Col>
      </Row>
      {renderFootnotes(props.footnoteText)}
    </section>
  )
}

Highmap.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  description: PropTypes.string,
  mapFile: PropTypes.string,
  tableData: PropTypes.array,
  thresholdValues: PropTypes.array,
  hideTitle: PropTypes.boolean,
  colorPalette: PropTypes.string,
  numberDecimals: PropTypes.string,
  heightAspectRatio: PropTypes.string,
  seriesTitle: PropTypes.string,
  legendTitle: PropTypes.string,
  legendAlign: PropTypes.string,
  footnoteText: PropTypes.array,
  phrases: PropTypes.object,
  language: PropTypes.string
}

export default (props) => <Highmap {...props} />
