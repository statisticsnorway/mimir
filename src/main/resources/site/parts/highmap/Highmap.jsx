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

function Highmap(props) {
  const desktop = useMediaQuery({
    minWidth: 992
  })
  const mapOptions = {
    chart: {
      height: props.heightAspectRatio && `${props.heightAspectRatio}%`
    },
    accessibility: {
      enabled: true,
      description: props.description && props.description
    },
    title: {
      text: props.title,
      align: 'left',
      style: props.hideTitle ? {
        color: 'transparent'
      } : {
        fontSize: '18px'
      }
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
      align: (props.legendAlign === ('topLeft' || 'bottomLeft')) ? 'left' : 'right', // WIP
      verticalAlign: (props.legendAlign === ('topLeft' || 'topRight')) ? 'top' : 'bottom', // WIP
      floating: true,
      layout: 'vertical',
      x: 0,
      y: (props.legendAlign === 'topLeft') ? 120 : 0,
      valueDecimals: props.numberDecimals && parseInt(props.numberDecimals),
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
        valueDecimals: props.numberDecimals && parseInt(props.numberDecimals)
      }
    }],
    credits: {
      enabled: false
    },
    exporting: { // WIP: exported graph does not display map
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
      {props.footnoteText.length &&
      <Row>
        {props.footnoteText.map((footnote, index) =>
          <Col className="col-12 p-lg-0" key={`footnote-${index}`}>
            <Text>{footnote}</Text>
          </Col>)}
      </Row>}
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
  phrases: PropTypes.object
}

export default (props) => <Highmap {...props} />
