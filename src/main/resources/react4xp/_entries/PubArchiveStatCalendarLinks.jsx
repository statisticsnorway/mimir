import React from 'react'
import { Link } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { ArrowRight, Calendar } from 'react-feather'

const PubArchiveStatCalendarLinks = (props) => {
  return (
    <React.Fragment>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 links-wrapper">
            {props.PublicationLink ? <Link
              href={props.PublicationLink}
              linkType="profiled"
              className='publication-link mr-5'
              icon={<ArrowRight size="18" />}
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: props.PublicationText
                }} />
            </Link> : ''}

            { props.CalendarLink ? <Link
              href={props.CalendarLink}
              className='calendar-link'
              icon={<Calendar size="16" />}
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: props.CalendarText
                }} />
            </Link> : ''}
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

PubArchiveStatCalendarLinks.propTypes = {
  PublicationLink: PropTypes.string.isRequired,
  PublicationText: PropTypes.node,
  CalendarLink: PropTypes.string.isRequired,
  CalendarText: PropTypes.node
}

export default PubArchiveStatCalendarLinks
