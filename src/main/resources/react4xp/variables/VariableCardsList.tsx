import React from 'react'
import { type VariablesProps } from '../../lib/types/partTypes/variables'
import VariableCard from './VariableCard'

interface VariableCardsListProps {
  variables: VariablesProps['variables']
}

function VariableCardsList(props: VariableCardsListProps) {
  const { variables } = props
  return (
    <div className='variable-cardlist grid-column grid-4'>
      {variables.map((variable, idx) => {
        return <VariableCard key={idx} variable={variable} />
      })}
    </div>
  )
}

export default VariableCardsList
