import React from 'react'
import PropTypes from 'prop-types'

function Bestbet(props) {
  return (
    <div>
      <h1>
        HELLO WORLD!!
      </h1>
      {props.value}
    </div>
  )
}

Bestbet.propTypes = {
  value: PropTypes.string
}

export default (props) => <Bestbet {...props} />

