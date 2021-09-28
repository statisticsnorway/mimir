import React from 'react'
import PropTypes from 'prop-types'

class MarkdownTest extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <section className="test">
        Vi kan sette inn feks en Highcharts her!
        {this.props.content.displayName}
        {this.props.content.markdown}
      </section>
    )
  }
}

export default (props) => <MarkdownTest {...props} />

MarkdownTest.propTypes = {
  content: PropTypes.shape({
    displayName: PropTypes.string,
    markdown: PropTypes.string
  })
}
