import React from 'react'
import PropTypes from 'prop-types'

function researcherList(props) {
  const { title } = props

  return (
    <section>
      {title}
    </section>
  )
}

export default (props) => <researcherList {...props} />

researcherList.propTypes = {
  title: PropTypes.string
}
