import React from 'react'
import { Card, Text } from '@statisticsnorway/ssb-component-library'
import { VariablesProps } from '../../lib/types/partTypes/variables'

interface VariableCardProps {
  variable: VariablesProps['variables'][0]
}

const VariableCard = ({ variable }: VariableCardProps) => {
  const { icon, description, ...rest } = variable

  return (
    <Card {...rest} icon={icon ? <img src={icon} alt={variable.title ? variable.title : ' '} /> : null}>
      <Text>{description}</Text>
    </Card>
  )
}

export default VariableCard
