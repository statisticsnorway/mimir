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
    if (advertismentList.length > 1) {
      return advertismentList.map(
        ({
          positionTitle,
          positionAdvertismentUrl,
          professionalField,
          location,
          employmentType,
          applicationDeadline,
        }) => {
          return (
            <div key=''>
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
            </div>
          )
        }
      )
    } else {
      // TODO: Should be in phrases instead; consult forretning
      return <span>{advertismentList[0].positionTitle as string}</span>
    }
  }

  // TODO: Bootstrap classes? Consider using css classes instead so we don't have duplicate styling done in different ways for publicationArchive, subjectArticleList, searchResultView etc
  // There will always be one item even if there are no advertisments published
  const advertismentListCount = advertismentList.length > 1 ? advertismentList.length : 0
  return (
    <div className='container'>
      <div className='row'>
        {title && (
          <Title className='col-12 mb-5' size={2}>
            {title}
          </Title>
        )}
      </div>
      <div className='row justify-content-md-center'>
        <div className='col-md-6 col-12'>
          {showingPhrase?.replace('{0}', advertismentListCount.toString())}&nbsp;
          <NumericFormat value={Number(advertismentListCount)} displayType='text' thousandSeparator=' ' />
          <Divider className='mt-2 mb-5' />
          {renderAdvertismentList()}
        </div>
      </div>
    </div>
  )
}

export default (props: WebcruiterAdvertismentListProps) => <WebcruiterAdvertistmentList {...props} />
