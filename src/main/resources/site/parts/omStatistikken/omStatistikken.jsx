import React from 'react'
import PropTypes from 'prop-types'
import Accordion from '../../../react4xp/_entries/Accordion'

const OmStatistikken = (props) => {
  const {
    ingress,
    label,
    accordions
  } = props

  function renderIngress() {
    if (ingress) {
      return (
        <p className="ingress-wrapper searchabletext col-lg-6">{ingress}</p>
      )
    }
    return null
  }
  return (
    <section className="xp-part part-om-statistikken container-fluid">
      <div className="row">
        <h2 className="title-wrapper col-12">{label}</h2>
        {renderIngress()}
        <div className="om-statistikken-accordion col-lg-7">
          <Accordion accordions={accordions}/>
        </div>
      </div>
    </section>
  )
}

OmStatistikken.propTypes = {
  label: PropTypes.string,
  ingress: PropTypes.string,
  accordions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      open: PropTypes.string.isRequired,
      subHeader: PropTypes.string,
      body: PropTypes.string,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          title: PropTypes.string,
          body: PropTypes.string
        })
      )
    })
  )
}

export default OmStatistikken
