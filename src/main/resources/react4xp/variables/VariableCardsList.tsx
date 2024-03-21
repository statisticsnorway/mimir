import React from 'react'
import { type VariablesProps } from '../../lib/types/partTypes/variables'
import VariableCard from './VariableCard'

interface VariableCardsListProps {
  variables: VariablesProps['variables'][]
}

class VariableCardsList extends React.Component<VariableCardsListProps> {
  constructor(props: VariableCardsListProps) {
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
