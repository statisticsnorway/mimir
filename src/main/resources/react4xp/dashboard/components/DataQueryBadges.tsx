import React from 'react'

interface DataQueryBadgesProps {
  contentType: string
  format?: string
  isPublished?: boolean
  floatRight?: boolean
}

export function DataQueryBadges(props: DataQueryBadgesProps) {
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
    <>
      <span className={`${floatRight ? 'float-end' : ''} detail ${decideType()}`}>{contentType.split(':').pop()}</span>
      <span className={`${floatRight ? 'float-end' : ''} detail ${format}`}>{format}</span>
      {!isPublished ? (
        <span className={`${floatRight ? 'float-end' : ''} detail unpublished`}>Ikke publisert</span>
      ) : null}
    </>
  )
}
