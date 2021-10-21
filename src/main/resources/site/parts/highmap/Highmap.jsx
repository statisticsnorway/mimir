import React from 'react'
// import Highcharts from 'highcharts'
import Highmaps from 'highcharts/highmaps'
import { HighchartsMapChart,
  HighmapsProvider,
  MapNavigation,
  MapSeries,
  Title,
  Subtitle,
  Tooltip,
  Credits,
  ColorAxis,
  Legend,
  Accessibility } from 'react-jsx-highmaps'
import { Fetch } from 'react-request'
import PropTypes from 'prop-types'

// require('highcharts/modules/accessibility')(Highcharts)
// require('highcharts/modules/exporting')(Highcharts)
// require('highcharts/modules/export-data')(Highcharts)

function Highmap(props) {
  return (
    <section className="part-highmap">
      <HighmapsProvider Highcharts={Highmaps}>
        <Fetch url={props.mapFile}>
          {({
            fetching, failed, data
          }) => {
            if (fetching) return <div>Loading…</div>
            if (failed) return <div>Failed to load map.</div>

            if (data) {
              const series = props.tableData
              //   const series = [
              //     ['Hordaland', 26.1],
              //     ['Troms', 38.1],
              //     ['Vestfold', 50.7],
              //     ['Oslo', 25.8],
              //     ['Hedmark', 25.9]
              //   ]
              //   const mappedSeries = series.map((element) => {
              //     const foundProp = data.find((it) => it.name == element[0])
              //     return [foundProp, element[1]]
              //   })
              //   console.log(mappedSeries)
              return (
                <HighchartsMapChart map={data}>
                  {props.title && <Title align="left" style={props.hideTitle ? {
                    color: 'transparent'
                  } : {
                    fontSize: '18px'
                  }}>{props.title}</Title>}
                  {props.subtitle && <Subtitle align="left">{props.subtitle}</Subtitle>}
                  {/* {props.description && <Accessibility description={props.description} />} */}

                  <MapSeries
                    data={series}
                    // data={props.tableData}
                    dataLabels={{
                      enabled: true,
                      color: '#FFFFFF',
                      format: '{point.name}'
                    }}
                  />

                  <MapNavigation>
                    <MapNavigation.ZoomIn/>
                    <MapNavigation.ZoomOut/>
                  </MapNavigation>

                  {/* TODO: Accomodate props.legendAlign */}
                  {props.legendTitle && <Legend title={props.legendTitle && props.legendTitle} align={'center'} verticalAlign={'bottom'}/>}

                  {/* {props.thresholdValues && <ColorAxis dataClasses={props.thresholdValues} dataClassColor="category" />}
                  {props.numberDecimals && <Tooltip valueDecimals={props.numberDecimals}/>} */}
                  <Credits enabled={false}/>
                </HighchartsMapChart>
              )
            }

            return null
          }}
        </Fetch>
      </HighmapsProvider>
    </section>
  )
}

Highmap.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  description: PropTypes.string,
  mapFile: PropTypes.string,
  tableData: PropTypes.array,
  thresholdValues: PropTypes.string,
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
