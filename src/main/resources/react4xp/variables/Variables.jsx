import React from 'react'
import PropTypes from 'prop-types'
import { Text } from '@statisticsnorway/ssb-component-library'
import VariableCardsList from './VariableCardsList.jsx'
import { variableType } from './types'

export const DISPLAY_TYPE_CARDS = 'CARDS'
export const DISPLAY_TYPE_TABLE = 'TABLE'

const Variables = ({ variables, display = DISPLAY_TYPE_CARDS }) => {
  if (display === DISPLAY_TYPE_CARDS) {
    return <VariableCardsList variables={variables} />
  }

  return <Text>TBD : Variables as table</Text>
}

Variables.propTypes = {
  variables: PropTypes.arrayOf(variableType),
  display: PropTypes.oneOf([DISPLAY_TYPE_CARDS, DISPLAY_TYPE_TABLE]),
}

export default Variables
