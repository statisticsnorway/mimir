import React from 'react'
import { Text } from '@statisticsnorway/ssb-component-library'
import VariableCardsList from './VariableCardsList'
import { variableType } from './types'

export const DISPLAY_TYPE_CARDS = 'CARDS'
export const DISPLAY_TYPE_TABLE = 'TABLE'

interface VariablesProps {
  variables?: unknown[];
  display?: unknown | unknown;
}

const Variables = ({
  variables,
  display = DISPLAY_TYPE_CARDS
}: VariablesProps) => {
  if (display === DISPLAY_TYPE_CARDS) {
    return <VariableCardsList variables={variables} />
  }

  return <Text>TBD : Variables as table</Text>
}

export default Variables
