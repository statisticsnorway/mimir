import React from 'react'
// import { Title, Link, Divider } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

function Employee(props) {
  const {
    title
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
  title: PropTypes.object
}

export default (props) => <Employee {...props} />
