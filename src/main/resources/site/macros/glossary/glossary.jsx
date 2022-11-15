import React from 'react'
import { Glossary as SSBGlossary } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

const Glossary = (props) => <SSBGlossary explanation={props.explanation}>{props.text}</SSBGlossary>

Glossary.propTypes = {
  text: PropTypes.string.isRequired,
  explanation: PropTypes.string.isRequired,
}

export default Glossary
