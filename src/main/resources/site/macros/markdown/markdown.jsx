import React from 'react'
import PropTypes from 'prop-types'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { ArrowRight } from 'react-feather'
import { Link } from '@statisticsnorway/ssb-component-library'


// class MarkdownTest extends React.Component {
//   constructor(props) {
//     super(props)
//   }
//   render() {
function MarkdownTest(props) {
  const options = {
    title: {
      text: 'My chart'
    },
    series: [{
      data: [1, 2, 3]
    }]
  }

  console.log(JSON.stringify(options, null, 2))
  // console.log(JSON.stringify(Highcharts, null, 2))

  return (
    <section className="test">
        Vi kan sette inn feks en Highcharts her!
      <div>
        <Link href={'/that/content'} isExternal={true} className="ssb-link header">
          {'En flott tekst med lenke som type'}
        </Link>
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
        />
      </div>
      {props.content}
      <ArrowRight size={12}></ArrowRight>
    </section>
  )
}

export default (props) => <MarkdownTest {...props} />

MarkdownTest.propTypes = {
  content: PropTypes.string
}
