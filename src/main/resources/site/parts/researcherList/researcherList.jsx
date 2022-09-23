import React from 'react'
import PropTypes from 'prop-types'

function ResearcherList(props) {
  const { title } = props

  return (
    <section className="xp-part employee container p-0 mb-5">
      {title}
    </section>
  )
}

export default (props) => <ResearcherList {...props} />

ResearcherList.propTypes = {
  title: PropTypes.string
}
