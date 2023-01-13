import React from 'react'
import { Card, Text } from '@statisticsnorway/ssb-component-library'
import { variableType } from '/react4xp/_entries/variables/types'

const VariableCard = ({ variable }) => {
  const { icon, description, ...rest } = variable

  return (
    <Card {...rest} icon={icon ? <img src={icon} alt={variable.title ? variable.title : ' '} /> : null}>
      <Text>{description}</Text>
    </Card>
  )
}

VariableCard.propTypes = {
  variable: variableType,
}

export default VariableCard
