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

  const mapOptions = {
    chart: {
      height: desktop && props.heightAspectRatio && `${props.heightAspectRatio}%`,
      style: {
        color: '#21383a',
        fontSize: '14px',
        fontWeight: 'normal',
        fontFamily: '"Open Sans Regular", "Arial", "DejaVu Sans", sans-serif',
      },
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
    colors:
      props.colorPalette === 'green'
        ? ['#e3f1e6', '#90cc93', '#25a23c', '#007e50', '#005245']
        : ['#f9f2d1', '#e8d780', '#d2bc2a', '#a67c36', '#6e4735'],
    colorAxis: {
      dataClasses: props.thresholdValues,
      dataClassColor: 'category',
    },
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
    series: [
      {
        mapData: props.mapFile,
        data: props.tableData,
        name: props.seriesTitle ? props.seriesTitle : '',
        joinBy: 'capitalName',
        dataLabels: {
          enabled: !props.hideTitle,
          format: '{point.properties.name}',
        },
        tooltip: {
          pointFormat: '{point.properties.name}: {point.value}',
          valueDecimals: props.numberDecimals,
        },
      },
    ],
    credits: {
      enabled: false,
    },
    exporting: {
      chartOptions: {
        chart: {
          spacingBottom: 30 + (props.sourceList ? props.sourceList.length * 30 : 0),
        },
        credits: {
          enabled: !!props.sourceList,
          text:
            props.sourceList &&
            props.sourceList.reduce((combinedSources, currentSource) => {
              return (
                combinedSources +
                `<b style="color:#274247">${props.phrases.source}: </b>${currentSource.sourceText}</br>`
              )
            }, ''),
          position: {
            align: 'left',
            x: 10,
            y: -20 - (props.sourceList ? props.sourceList.length * 20 : 0),
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
  style: PropTypes.object,
  thresholdValues: PropTypes.array,
  hideTitle: PropTypes.boolean,
  colorPalette: PropTypes.string,
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
