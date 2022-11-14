import React from 'react'
import PropTypes from 'prop-types'

export function DataQueryBadges(props) {
  const { contentType, format, isPublished, floatRight = true } = props

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
      <span className={`${floatRight ? 'float-end' : ''} detail ${decideType(contentType)}`}>
        {contentType.split(':').pop()}
      </span>
      <span className={`${floatRight ? 'float-end' : ''} detail ${format}`}>{format}</span>
      {!isPublished ? (
        <span className={`${floatRight ? 'float-end' : ''} detail unpublished`}>Ikke publisert</span>
      ) : null}
    </React.Fragment>
  )
}

DataQueryBadges.propTypes = {
  contentType: PropTypes.string,
  format: PropTypes.string,
  isPublished: PropTypes.bool,
  floatRight: PropTypes.bool,
}
