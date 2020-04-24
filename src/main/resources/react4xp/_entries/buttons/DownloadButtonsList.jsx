import React from 'react'
import PropTypes from 'prop-types'
import DownloadButtonComponent from './DownloadButtonComponent.jsx'
import { buttonsType } from './types'

const DownloadButtonsList = ({
  buttons
}) =>
  buttons.map((button, idx) => <DownloadButtonComponent key={idx} button={button} />)

DownloadButtonsList.propTypes = {
  buttons: PropTypes.arrayOf(buttonsType)
}

export default DownloadButtonsList
