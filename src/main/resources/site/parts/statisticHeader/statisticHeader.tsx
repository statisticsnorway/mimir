import React from 'react'
import { Row } from 'react-bootstrap'
import { Glossary } from '@statisticsnorway/ssb-component-library'
import { type StatisticHeader } from '../../../lib/types/partTypes/statisticHeader'
import { sanitize } from '../../../lib/ssb/utils/htmlUtils'

function StatisticHeader(props: StatisticHeader) {
  const { title, ingress, nextRelease, nextUpdate, updated, changed, changeDate, modifiedText, previousRelease } = props

  return (
    <section className='xp-part statistic-header'>
      <Row>
        <div className='title-ingress-wrapper'>
          <p className='introTitle searchabletext'>Statistikk om</p>
          <h1 className='mt-0 pt-0 position-relative' aria-hidden='true'>
            {title}
          </h1>
          <div className='col-md-8 col-12'>
            <p className='ingress searchabletext'>{ingress}</p>
          </div>
        </div>
      </Row>
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
    </section>
  )
}

export default (props: StatisticHeader) => <StatisticHeader {...props} />
