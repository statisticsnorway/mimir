import React from 'react'
import { Glossary, Title } from '@statisticsnorway/ssb-component-library'
import { type StatisticHeader } from '../../../lib/types/partTypes/statisticHeader'
import { sanitize } from '../../../lib/ssb/utils/htmlUtils'

function StatisticHeader(props: StatisticHeader) {
  const {
    title,
    ingress,
    nextRelease,
    nextUpdate,
    updated,
    changed,
    statisticsAbout,
    changeDate,
    modifiedText,
    previousRelease,
  } = props

  return (
    <React.Fragment>
      <div className='title-ingress-wrapper'>
        <p className='introTitle'>{statisticsAbout}</p>
        <Title size={1}>{title}</Title>
        <div className='ingress col-md-8 col-12'>
          <p className='searchabletext'>{ingress}</p>
        </div>
      </div>
      <div className='titles-dates-wrapper'>
        <div className='updatedDate'>
          <span className='fw-bold'>{updated}</span>
          <span>{previousRelease}</span>
        </div>
        <div className='nextUpdateDate'>
          <span className='fw-bold'>{nextUpdate}</span>
          <span data-th-text='${nextRelease}'>{nextRelease}</span>
        </div>
        {changeDate?.length && modifiedText ? (
          <div className='modifiedDate'>
            <span className='fw-bold'>{changed}</span>
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
