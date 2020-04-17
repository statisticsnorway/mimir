import React from 'react';
import Interweave from 'interweave';
import { Card, Text } from '@statisticsnorway/ssb-component-library';
import { variableType } from './types';

const VariableCard = ({ variable }) => {
    const { icon, description, ...rest} = variable;
    return (
        <Card
            {...rest}
            icon={icon ? <img src={icon} alt={variable.title} /> : null}
        >
            <Text><Interweave content={description} /></Text>
        </Card>
    );
};

VariableCard.propTypes = {
    variable: variableType,
};

export default VariableCard;