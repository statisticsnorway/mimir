import React from 'react'
import { Download } from 'react-feather'

interface DownloadLinkProps {
  downloadText: string
  fileLocation: string
}

const DownloadLink = ({ fileLocation, downloadText }: DownloadLinkProps) => {
  return (
    <div className='download-link-wrapper'>
      <a download href={fileLocation} className='ssb-btn primary-btn'>
        <Download className='download-icon' size={18} />
        {downloadText}
      </a>
    </div>
  )
}

export default (props: DownloadLinkProps) => <DownloadLink {...props} />
