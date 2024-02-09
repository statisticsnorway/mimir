import React from 'react'

import MathJax from 'react-mathjax'
import PropTypes from 'prop-types'

class Maths extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <MathJax.Provider>
        <MathJax.Node formula={this.props.mathsFormula} />
      </MathJax.Provider>
    )
  }
}

Maths.propTypes = {
  mathsFormula: PropTypes.string,
}

export default (props) => <Maths {...props} />
