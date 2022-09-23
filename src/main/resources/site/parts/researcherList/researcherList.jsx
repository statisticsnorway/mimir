import React from 'react'
import PropTypes from 'prop-types'

function researcherList(props) {
  const { title } = props

  return (
    <section className="xp-part employee container p-0 mb-5">
      {title}
    </section>
  )
}

export default (props) => <researcherList {...props} />

researcherList.propTypes = {
  title: PropTypes.string
}
