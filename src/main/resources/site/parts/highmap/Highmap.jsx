import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import PropTypes from 'prop-types'

require('highcharts/modules/accessibility')(Highcharts)
require('highcharts/modules/exporting')(Highcharts)
require('highcharts/modules/export-data')(Highcharts)
require('highcharts/modules/map')(Highcharts)

function Highmap(props) {
  // const series = props.tableData
  const seriesData = [
    {
      name: 'Nordland',
      value: 26.2
    },
    {
      name: 'Trøndelag',
      value: 36.7
    },
    {
      name: 'Hordaland',
      value: 26.1
    },
    {
      name: 'Troms',
      value: 38.1
    },
    {
      name: 'Vestfold',
      value: 50.7
    },
    {
      name: 'Hedmark',
      value: 25.9
    }
  ]
  //   const mappedSeries = series.map((element) => {
  //     const foundProp = data.find((it) => it.name == element[0])
  //     return [foundProp, element[1]]
  //   })
  //   console.log(mappedSeries)

  const mapOptions = {
    chart: {
      height: props.heightAspectRatio ? `${props.heightAspectRatio}%` : '60%'
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
      dataClasses: props.thresholdValues && props.thresholdValues, // TODO: WIP
      dataClassColor: 'category'
    },
    legend: {
      title: {
        text: props.legendTitle && props.legendTitle,
        style: {
          color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
        }
      },
      align: (props.legendAlign === ('topLeft' || 'bottomLeft')) ? 'left' : 'right', // TODO: WIP
      verticalAlign: (props.legendAlign === ('topLeft' || 'topRight')) ? 'top' : 'bottom', // TODO: WIP
      floating: true,
      layout: 'vertical',
      x: 0,
      y: (props.legendAlign === 'bottomLeft') ? 85 : 0, // TODO: WIP
      valueDecimals: props.numberDecimals && parseInt(props.numberDecimals),
      backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || 'rgba(255, 255, 255, 0.85)',
      symbolRadius: 0,
      symbolHeight: 14
    },
    series: [{
      mapData: props.mapFile,
      data: props.tableData,
      name: props.seriesTitle ? point.seriesTitle : '',
      joinBy: 'name',
      dataLabels: {
        enabled: !props.hideTitle, // TODO: WIP
        format: '{point.properties.name}'
      },
      tooltip: {
        pointFormat: '{point.properties.name}: {point.value}',
        valueDecimals: props.numberDecimals && parseInt(props.numberDecimals)
      }
    }],
    credits: {
      enabled: false
    }
  }

  return (
    <section className="part-highmap">
      <HighchartsReact
        highcharts={Highcharts}
        constructorType={'mapChart'}
        options={mapOptions}
      />
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
  footnoteText: PropTypes.array
}

export default (props) => <Highmap {...props} />
