import React from 'react'
import { Button, Glossary, Title } from '@statisticsnorway/ssb-component-library'
import { type StatisticHeader } from '../../../lib/types/partTypes/statisticHeader'
import { sanitize } from '../../../lib/ssb/utils/htmlUtils'

function StatisticHeader(props: StatisticHeader) {
  const {
    title,
    ingress,
    nextRelease,
    nextUpdatePhrase,
    updatedPhrase,
    changedPhrase,
    statisticsAbout,
    changeDate,
    modifiedText,
    previousRelease,
    showPreviewDraft,
    previewButtonUrl,
    previewButtonText,
  } = props

  function renderShowDraftButton() {
    if (showPreviewDraft) {
      return (
        <div className='show-draft col-12'>
          <Button className='float-end' primary onClick={() => (window.location.href = previewButtonUrl)}>
            {previewButtonText}
          </Button>
        </div>
      )
    }
    return null
  }

  return (
    <React.Fragment>
      {renderShowDraftButton()}
      <div className='title-ingress-wrapper'>
        <p className='introTitle'>{statisticsAbout}</p>
        <Title size={1}>{title}</Title>
        <div className='ingress col-md-8 col-12'>
          <p className='searchabletext'>{ingress}</p>
        </div>
      </div>
      <div className='titles-dates-wrapper'>
        <div className='updatedDate'>
          <span className='fw-bold'>{updatedPhrase}</span>
          <span>{previousRelease}</span>
        </div>
        <div className='nextUpdateDate'>
          <span className='fw-bold'>{nextUpdatePhrase}</span>
          <span>{nextRelease}</span>
        </div>
        {changeDate?.length && modifiedText ? (
          <div className='modifiedDate'>
            <span className='fw-bold'>{changedPhrase}</span>
            <Glossary explanation={modifiedText}>
              <span
                dangerouslySetInnerHTML={{
                  __html: sanitize(changeDate),
                }}
              />
            </Glossary>
          </div>
        ) : null}
      </div>
    </React.Fragment>
  )
}

export default (props: StatisticHeader) => <StatisticHeader {...props} />
