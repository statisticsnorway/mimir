import React from 'react'

import { Title, Divider, Link } from '@statisticsnorway/ssb-component-library'
import { NumericFormat } from 'react-number-format'

import {
  type WebcruiterAdvertisementListProps,
  type AdvertisementList,
  type WebcruiterAdvertisementListRssFeedResponseErrorMessage,
} from '../../../lib/types/partTypes/webcruiterAdvertisementList'

const WebcruiterAdvertistmentList = (props: WebcruiterAdvertisementListProps) => {
  const {
    title,
    showingPhrase,
    advertisementList,
    professionalFieldPhrase,
    locationPhrase,
    employmentTypePhrase,
    applicationDeadlinePhrase,
    noResultsPhrase,
  } = props

  function renderAdvertisementListItem() {
    if ((advertisementList as WebcruiterAdvertisementListRssFeedResponseErrorMessage).errorMessage) {
      return (
        <li>
          <span className='no-results'>
            {(advertisementList as WebcruiterAdvertisementListRssFeedResponseErrorMessage).errorMessage}
          </span>
        </li>
      )
    } else {
      return (advertisementList as AdvertisementList[]).map(
        (
          { positionTitle, positionAdvertisementUrl, professionalField, location, employmentType, applicationDeadline },
          index
        ) => {
          return (
            <li key={`webcruiter-advertisement-list-${applicationDeadline}-${index}`}>
              {positionTitle && positionAdvertisementUrl ? (
                <Link linkType='header' headingSize={3} href={positionAdvertisementUrl}>
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
      )
    }
  }

  const advertisementListCount = (advertisementList as AdvertisementList[]).length
  const hasResults =
    !(advertisementList as WebcruiterAdvertisementListRssFeedResponseErrorMessage).errorMessage &&
    (advertisementList as AdvertisementList[])[0]?.positionTitle &&
    (advertisementList as AdvertisementList[])[0]?.positionAdvertisementUrl
  return (
    <div className='container'>
      {title && <Title size={2}>{title}</Title>}
      <div className='row justify-content-md-center'>
        <div className='col-md-6 col-12'>
          {hasResults && (
            <>
              <div className='total-count'>
                {showingPhrase?.replace('{0}', advertisementListCount.toString())}&nbsp;
                <NumericFormat value={Number(advertisementListCount)} displayType='text' thousandSeparator=' ' />
              </div>
              <Divider />
            </>
          )}
          <ol className='list-unstyled'>{renderAdvertisementListItem()}</ol>
        </div>
      </div>
    </div>
  )
}

export default WebcruiterAdvertistmentList
