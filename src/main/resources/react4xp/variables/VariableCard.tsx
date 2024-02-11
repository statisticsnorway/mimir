import React from 'react'
import { Card, Text } from '@statisticsnorway/ssb-component-library'
import { variableType } from './types'

interface VariableCardProps {
  variable?: unknown;
}

const VariableCard = ({
  variable
}: VariableCardProps) => {
  const { icon, description, ...rest } = variable

  return (
    <Card {...rest} icon={icon ? <img src={icon} alt={variable.title ? variable.title : ' '} /> : null}>
      <Text>{description}</Text>
    </Card>
  )
}

export default VariableCard
