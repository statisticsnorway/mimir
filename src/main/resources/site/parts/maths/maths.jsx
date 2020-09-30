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
        <span>
          This is an inline math formula: <MathJax.Node inline formula={'a = b'} />
          <br/>
          And a block one:
          <MathJax.Node formula={this.props.mathsFormula} />
          <br/>
          And a big, complex inline formula <MathJax.Node inline formula={this.props.mathsFormula} />
        </span>
      </MathJax.Provider>
    )
  }
}

Maths.propTypes = {
  mathsFormula: PropTypes.string
}

export default (props) => <Maths {...props} />

