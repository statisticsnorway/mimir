import React from 'react'
import { Card, Text } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

const Datasets = (props) => {
  return (
    <React.Fragment>
      {props.dataset.map((dataset, i) =>
        <Card
          key={`dataset-${i}`}
          className={dataset.className}
          title={dataset.title}
          fileLocation={dataset.fileLocation}
          downloadText={dataset.downloadText}
          href={dataset.href}
          icon={dataset.iconUrl ? <img src={dataset.iconUrl} alt={dataset.imageAltText} /> : undefined}
          profiled={dataset.profiled}
        >
          <Text
            dangerouslySetInnerHTML={{
              ___html: dataset.description
            }}
          >
          </Text>
        </Card>
      )}
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

