import React from 'react';
import PropTypes from 'prop-types';
import VariableCard from './VariableCard.jsx';
import { variableType } from './types';

const VariablesCards = ({ variables }) =>
    variables.map(variable => <VariableCard variable={variable} />);

VariablesCards.propTypes = {
    variables: PropTypes.arrayOf(variableType),
};

export default VariablesCards;