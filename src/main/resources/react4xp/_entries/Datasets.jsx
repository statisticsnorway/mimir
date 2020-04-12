import React from 'react'
import PropTypes from 'prop-types'
import Variables from './datasets/variables/Variables.jsx';

const Datasets = ({ dataset }) => {
  return (
    <React.Fragment>
        <Variables variables={dataset} />
    </React.Fragment>
  )
}

Datasets.propTypes = {
  dataset: PropTypes.arrayOf(
    PropTypes.shape({
      className: PropTypes.string,
      downloadText: PropTypes.string,
      fileLocation: PropTypes.string,
      href: PropTypes.string.isRequired,
      imageAltText: PropTypes.string,
      icon: PropTypes.element,
      iconUrl: PropTypes.string,
      profiled: PropTypes.bool,
      description: PropTypes.node,
      title: PropTypes.string
    })
  )
}

export default Datasets

