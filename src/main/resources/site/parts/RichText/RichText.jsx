import React from 'react'
import PropTypes from 'prop-types'
import '@statisticsnorway/ssb-component-library'

const RichText = ({ text, textType }) => {
  const processedText = text.replace(/<(\/*)p>/gm, '<$1span>')

  let className = ''

  switch (textType) {
    case 'ingress':
      className = 'ssb-lead-paragraph'
      break
    case 'brodtekst':
      className = 'ssb-paragraph'
      break
    case 'mikrotekst':
      className = 'ssb-text-wrapper small-text'
  }

  return <div className={className} dangerouslySetInnerHTML={{ __html: processedText }} />
}

RichText.propTypes = {
  text: PropTypes.string.isRequired,
  textType: PropTypes.string.isRequired,
}

export default (props) => <RichText {...props} />
