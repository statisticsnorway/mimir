import React from 'react';
import { variableType } from './types';

const VariableCard = ({ variable }) => {
    const { title, description, icon } = variable;

    return (
        <Card
            title={title}
            icon={<img src={icon} alt={title} />}
        >
            <Text>{description}</Text>
        </Card>
    );
};

VariableCard.propTypes = {
    variable: variableType,
};