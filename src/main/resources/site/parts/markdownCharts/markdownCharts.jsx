import React from 'react'
import PropTypes from 'prop-types'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

function MarkdownCharts(props) {
  return (
    <section className="markdown-charts">
      <div>
        <HighchartsReact
          highcharts={Highcharts}
          options={props.options}
        />
      </div>
    </section>
  )
}

export default (props) => <MarkdownCharts {...props} />

MarkdownCharts.propTypes = {
  options: PropTypes.object
}
