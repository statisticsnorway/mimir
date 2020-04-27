import React from 'react'
import PropTypes from 'prop-types'
import { Text } from '@statisticsnorway/ssb-component-library'
import DownloadButtonsList from './DownloadButtonsList.jsx'
import { buttonsType } from './types'

export const DISPLAY_TYPE_BUTTONS = 'BUTTONS'
export const DISPLAY_TYPE_LIST = 'LIST'

const DownloadButton = ({
  buttons, display = DISPLAY_TYPE_BUTTONS
}) => {
  if (display === DISPLAY_TYPE_BUTTONS) {
    return <DownloadButtonsList buttons={buttons}/>
  }

  return <Text>TBD : List of buttons</Text>
}

DownloadButton.propTypes = {
  buttons: PropTypes.arrayOf(buttonsType),
  display: PropTypes.oneOf([DISPLAY_TYPE_BUTTONS, DISPLAY_TYPE_LIST])
}

export default DownloadButton
