import React from 'react'

import { Title, Divider, Link } from '@statisticsnorway/ssb-component-library'
import { NumericFormat } from 'react-number-format'

import { type WebcruiterAdvertismentListProps } from '/lib/types/partTypes/webcruiterAdvertismentList'

const WebcruiterAdvertistmentList = (props: WebcruiterAdvertismentListProps) => {
  const {
    title,
    showingPhrase,
    advertismentList,
    professionalFieldPhrase,
    locationPhrase,
    employmentTypePhrase,
    applicationDeadlinePhrase,
    noResultsPhrase,
  } = props

  function renderAdvertismentList() {
    return (
      <ol className='list-unstyled'>
        {advertismentList.map(
          (
            {
              positionTitle,
              positionAdvertismentUrl,
              professionalField,
              location,
              employmentType,
              applicationDeadline,
            },
            index
          ) => {
            return (
              <li key={`webcruiter-advertisment-list-${applicationDeadline}-${index}`}>
                {positionTitle && positionAdvertismentUrl ? (
                  <Link linkType='header' href={positionAdvertismentUrl}>
                    {positionTitle}
                  </Link>
                ) : (
                  <span className='no-results'>{noResultsPhrase}</span>
                )}
                <div className='d-flex flex-column mt-2'>
                  {professionalField && (
                    <span>
                      {professionalFieldPhrase}: {professionalField as string}
                    </span>
                  )}
                  {location && (
                    <span>
                      {locationPhrase}: {location as string}
                    </span>
                  )}
                  {employmentType && (
                    <span>
                      {employmentTypePhrase}: {employmentType as string}
                    </span>
                  )}
                  {applicationDeadline && (
                    <span>
                      {applicationDeadlinePhrase}: {applicationDeadline as string}
                    </span>
                  )}
                </div>
              </li>
            )
          }
        )}
      </ol>
    )
  }

  const advertismentListCount = advertismentList.length
  const hasResults = advertismentList[0]?.positionTitle && advertismentList[0]?.positionAdvertismentUrl
  return (
    <div className='container'>
      {title && <Title size={2}>{title}</Title>}
      <div className='row justify-content-md-center'>
        <div className='col-md-6 col-12'>
          {hasResults && (
            <>
              <div className='total-count'>
                {showingPhrase?.replace('{0}', advertismentListCount.toString())}&nbsp;
                <NumericFormat value={Number(advertismentListCount)} displayType='text' thousandSeparator=' ' />
              </div>
              <Divider />
            </>
          )}
          {renderAdvertismentList()}
        </div>
      </div>
    </div>
  )
}

export default WebcruiterAdvertistmentList
