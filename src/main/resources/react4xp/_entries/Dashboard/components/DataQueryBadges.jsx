import React from 'react'
import PropTypes from 'prop-types'

export function DataQueryBadges(props) {
  const {
    contentType, format, isPublished
  } = props

  function decideType() {
    switch (contentType) {
    case 'mimir:keyFigure':
      return 'keyfigureType'
    case 'mimir:highchart':
      return 'highchartsType'
    case 'mimir:table':
      return 'tableType'
    default:
      return ''
    }
  }

  return (
    <React.Fragment>
      <span className={`float-right detail ${decideType(contentType)}`}>{contentType.split(':').pop()}</span>
      <span className={'float-right detail ' + format}>{format}</span>
      {!isPublished ? <span className={'float-right detail unpublished'}>Ikke publisert</span> : null}
    </React.Fragment>
  )
}

DataQueryBadges.propTypes = {
  contentType: PropTypes.string,
  format: PropTypes.string,
  isPublished: PropTypes.bool
}
