import React from 'react'
import PropTypes from 'prop-types'
import VariableCard from './VariableCard.jsx'
import { variableType } from './types'

const VariableCardsList = ({
  variables
}) =>
  variables.map((variable, idx) => <VariableCard key={idx} variable={variable} />)

VariableCardsList.propTypes = {
  variables: PropTypes.arrayOf(variableType)
}

export default VariableCardsList
