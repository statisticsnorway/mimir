import React from 'react'
import { StatisticsProps } from '../../../lib/types/partTypes/statistics'

function Statistic(props: StatisticsProps) {
  return (
    <section className='xp-part statistics container'>
      <div className='row'>
        {props.showPreviewDraft && (
          <div className='col-12' data-th-if='${showPreviewDraft}'>
            <a className='ssb-btn primary-btn float-end' href={props.draftUrl}>
              {props.draftButtonText}
            </a>
          </div>
        )}
        <div className='col-12'>
          <h1 className='mb-5 mt-4 p-0'>{props.title}</h1>
        </div>
        <div className='col-12 col-lg-6'>
          <div className='titles-dates-wrapper container'>
            <div className='row'>
              <p className='col-md-6 mb-2 col-12' id='updatedDate'>
                <span className='fw-bold'>{props.updated}</span>
                <span>{props.previousRelease}</span>
              </p>

              <p className='col-md-6 col-12' id='changedDate'>
                <span className='fw-bold'>{props.changed}</span>
                {/* <span id='${modifiedDateId}'>{props.changeDate}</span> */}
                {/* {props.changeDate && <ModifiedDate />} */}
              </p>

              <p className='col-12' id='nextUpdateDate'>
                <span className='fw-bold'>{props.updated}</span>
                <span>{props.nextRelease}</span>
              </p>
            </div>
          </div>
        </div>

        {props.statisticsKeyFigure && (
          <div
            className='col-12 col-lg-6'
            dangerouslySetInnerHTML={{
              __html: props.statisticsKeyFigure,
            }}
          ></div>
        )}
      </div>
    </section>
  )
}

export default (props: StatisticsProps) => <Statistic {...props} />
