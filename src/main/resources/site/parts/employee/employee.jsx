import React from 'react'
// import { Title, Link, Divider } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

function Employee(props) {
  const {
    title, email, position, phone, description, profileImages, myCV, projects, isResearcher, cristinId
  } = props

  return (
    <section className="xp-part employee container p-0 mb-5">
      <div className="row">
        <h1>{title}</h1>
      </div>
    </section>
  )
}

Employee.propTypes = {
  title: PropTypes.string,
  email: PropTypes.string,
  position: PropTypes.string,
  phone: PropTypes.string,
  description: PropTypes.string,
  profileImages: PropTypes.array,
  myCV: PropTypes.string,
  projects: PropTypes.array,
  isResearcher: PropTypes.bool,
  cristinId: PropTypes.string | null
}

export default (props) => <Employee {...props} />
