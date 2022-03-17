import React from 'react'
import { Link } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { ArrowRight, Calendar } from 'react-feather'

const PubArchiveStatCalendarLinks = (props) => {
  return (
    <React.Fragment>
      <div className="container">
        <div className="row d-lg-flex justify-content-center">
          <div className="col-12 col-lg-5 links-wrapper">
            {props.PublicationLink ? <Link
              href={props.PublicationLink}
              linkType="profiled"
              className='publication-link mb-md-0 mb-4'
              icon={<ArrowRight size="18" />}
            >
              { props.PublicationText }
            </Link> : ''}

            { props.CalendarLink ? <Link
              href={props.CalendarLink}
              className='calendar-link'
              icon={<Calendar size="16" />}
            >
              { props.CalendarText }
            </Link> : ''}
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

PubArchiveStatCalendarLinks.propTypes = {
  PublicationLink: PropTypes.string.isRequired,
  PublicationText: PropTypes.string,
  CalendarLink: PropTypes.string.isRequired,
  CalendarText: PropTypes.string
}

export default PubArchiveStatCalendarLinks
