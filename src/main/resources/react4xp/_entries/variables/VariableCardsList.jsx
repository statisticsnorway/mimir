import React from 'react'
import PropTypes from 'prop-types'
import VariableCard from '/react4xp/_entries/variables/VariableCard.jsx'
import { variableType } from '/react4xp/_entries/variables/types'

class VariableCardsList extends React.Component {
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

VariableCardsList.propTypes = {
  variables: PropTypes.arrayOf(variableType),
}

export default VariableCardsList
