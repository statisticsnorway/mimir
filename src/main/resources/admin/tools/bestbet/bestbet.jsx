import React from 'react'
import PropTypes from 'prop-types'

class Bestbet extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        <h1>
              HELLO WOLRD!!
        </h1>
      </div>
    )
  }
}

Bestbet.propTypes = {
  value: PropTypes.string
}

export default (props) => <Bestbet {...props} />

