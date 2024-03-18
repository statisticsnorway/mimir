import React from 'react'
import { Download } from 'react-feather'
import PropTypes from 'prop-types'

const DownloadLink = ({ fileLocation, downloadText }) => {
  return (
    <div className='download-link-wrapper'>
      <a download href={fileLocation} className='ssb-btn primary-btn'>
        <Download className='download-icon' size={18} />
        {downloadText}
      </a>
    </div>
  )
}

DownloadLink.propTypes = {
  downloadText: PropTypes.string,
  fileLocation: PropTypes.string,
}

export default DownloadLink
