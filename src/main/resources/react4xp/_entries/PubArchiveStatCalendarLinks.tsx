import React from 'react'
import { Link } from '@statisticsnorway/ssb-component-library'
import { ArrowRight, Calendar } from 'react-feather'

interface PubArchiveStatCalendarLinksProps {
  PublicationLink: string
  PublicationText?: string
  CalendarLink: string
  CalendarText?: string
}

const PubArchiveStatCalendarLinks = (props: PubArchiveStatCalendarLinksProps) => {
  return (
    <div className='container'>
      <div className='row d-lg-flex justify-content-center'>
        <div className='col-12 col-lg-5 links-wrapper'>
          {props.PublicationLink ? (
            <Link
              href={props.PublicationLink}
              linkType='profiled'
              className='publication-link mb-md-0 mb-4'
              icon={<ArrowRight size='18' />}
              standAlone
            >
              {props.PublicationText}
            </Link>
          ) : (
            ''
          )}

          {props.CalendarLink ? (
            <Link href={props.CalendarLink} className='calendar-link' icon={<Calendar size='16' />} standAlone>
              {props.CalendarText}
            </Link>
          ) : (
            ''
          )}
        </div>
      </div>
    </div>
  )
}

export default (props: PubArchiveStatCalendarLinksProps) => <PubArchiveStatCalendarLinks {...props} />
