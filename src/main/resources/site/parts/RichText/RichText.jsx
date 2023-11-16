import React from 'react'
import PropTypes from 'prop-types'
import '@statisticsnorway/ssb-component-library'

const RichText = ({ text, textType }) => {
  const processedText = text.replace(/<(\/*)p>/gm, '<$1span>')

  const className =
    textType === 'ingress'
      ? 'ssb-lead-paragraph'
      : textType === 'brodtekst'
      ? 'ssb-paragraph'
      : textType === 'mikrotekst'
      ? 'ssb-text-small'
      : ''

  return <div className={className} dangerouslySetInnerHTML={{ __html: processedText }} />
}

RichText.propTypes = {
  text: PropTypes.string.isRequired,
  textType: PropTypes.string.isRequired,
}

export default (props) => <RichText {...props} />
