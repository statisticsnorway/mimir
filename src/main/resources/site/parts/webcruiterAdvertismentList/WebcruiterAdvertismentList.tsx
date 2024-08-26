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
  } = props

  function renderAdvertismentList() {
    return (
      <ol className='list-unstyled'>
        {advertismentList.length > 1 ? (
          advertismentList.map(
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
                  <Link linkType='header' href={positionAdvertismentUrl}>
                    {positionTitle}
                  </Link>
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
          )
        ) : (
          <li>{advertismentList[0].positionTitle as string}</li>
        )}
      </ol>
    )
  }

  // There will always be one item even if there are no advertisments published
  const advertismentListCount = advertismentList.length > 1 ? advertismentList.length : 0
  return (
    <div className='container'>
      {title && <Title size={2}>{title}</Title>}
      <div className='row justify-content-md-center'>
        <div className='col-md-6 col-12'>
          <div className='total-count'>
            {showingPhrase?.replace('{0}', advertismentListCount.toString())}&nbsp;
            <NumericFormat value={Number(advertismentListCount)} displayType='text' thousandSeparator=' ' />
          </div>
          <Divider />
          {renderAdvertismentList()}
        </div>
      </div>
    </div>
  )
}

export default WebcruiterAdvertistmentList
