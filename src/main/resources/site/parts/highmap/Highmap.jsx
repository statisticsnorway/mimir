import React from 'react'
import Highmaps from 'highcharts/highmaps'
import { HighchartsMapChart, HighmapsProvider, MapNavigation, MapSeries, Title, Tooltip, Credits } from 'react-jsx-highmaps'
import { Fetch } from 'react-request'
import PropTypes from 'prop-types'

function Highmap(props) {
  return (
    <section className="part-highmap">
      <HighmapsProvider Highcharts={Highmaps}>
        <Fetch url={props.mapfile}>
          {({
            fetching, failed, data
          }) => {
            if (fetching) return <div>Loading…</div>
            if (failed) return <div>Failed to load map.</div>

            if (data) {
              return (
                <HighchartsMapChart map={data}>
                  <Title>Nordic countries</Title>

                  <MapSeries
                    data={[
                      ['is', 1],
                      ['no', 1],
                      ['se', 1],
                      ['dk', 1],
                      ['fi', 1]
                    ]}
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

                  <Tooltip/>

                  <Credits/>
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
  mapfile: PropTypes.string
}

export default (props) => <Highmap {...props} />
