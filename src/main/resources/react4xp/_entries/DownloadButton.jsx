import React from 'react'
import { Download } from 'react-feather'
import PropTypes from 'prop-types'

const DownloadButton = ({
  fileLocation, downloadText
}) => (
  <a download href={fileLocation} className="ssb-btn primary-btn">
    <Download className="download-icon" size={18} />
    {downloadText}
  </a>
)

DownloadButton.propTypes = {
  downloadText: PropTypes.string,
  fileLocation: PropTypes.string
}

export default DownloadButton
