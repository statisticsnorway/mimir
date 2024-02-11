import React from 'react'
import VariableCard from './VariableCard'
import { variableType } from './types'

interface VariableCardsListProps {
  variables?: unknown[];
}

class VariableCardsList extends React.Component<VariableCardsListProps> {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className='variable-cardlist grid-column grid-4'>
        {this.props.variables.map((variable, idx) => {
          return <VariableCard key={idx} variable={variable} />
        })}
      </div>
    )
  }
}

export default VariableCardsList
