import React from 'react'

import MathJax from 'react-mathjax'

const tex = `f(x) = \\int_{-\\infty}^\\infty\\hat f(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi`

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
          <MathJax.Node formula={tex} />
          <br/>
          And a big, complex inline formula <MathJax.Node inline formula={tex} />
        </span>
      </MathJax.Provider>
    )
  }
}
export default () => <Maths/>

