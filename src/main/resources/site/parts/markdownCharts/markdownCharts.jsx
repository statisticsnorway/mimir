import React from 'react'
import PropTypes from 'prop-types'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

function MarkdownCharts(props) {
  const options = {
    title: {
      text: 'My chart'
    },
    series: [{
      data: [1, 2, 3]
    }]
  }

  return (
    <section className="markdown-charts">
      <div>
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
        />
      </div>
    </section>
  )
}

export default (props) => <MarkdownCharts {...props} />

MarkdownCharts.propTypes = {
  content: PropTypes.string
}
