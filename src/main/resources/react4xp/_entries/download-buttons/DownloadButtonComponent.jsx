import React from 'react'
import { buttonsType } from './types'
import { Download } from 'react-feather'

const DownloadButtonComponent = ({
  button
}) => {
  const {
    fileLocation, downloadText
  } = button
  return (
    <div className="download-btn-wrapper">
      <a download href={fileLocation} className="ssb-btn primary-btn">
        <Download className="download-icon" size={18} />
        {downloadText}
      </a>
    </div>
  )
}

DownloadButtonComponent.propTypes = {
  button: buttonsType
}

export default DownloadButtonComponent
