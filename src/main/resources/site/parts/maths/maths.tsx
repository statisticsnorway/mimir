import React from 'react'

import MathJax from 'react-mathjax'

interface MathsProps {
  mathsFormula?: string;
}

class Maths extends React.Component<MathsProps> {
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

export default (props) => <Maths {...props} />
