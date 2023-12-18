import React from 'react'
import PropTypes from 'prop-types'
import { LeadParagraph, Text, Paragraph } from '@statisticsnorway/ssb-component-library'

const RichText = ({ text, textType, inLayout }) => {
  const renderText = () => {
    const textComponent = <span dangerouslySetInnerHTML={{ __html: text }} />
    switch (textType) {
      case 'ingress':
        return <LeadParagraph>{textComponent}</LeadParagraph>
      case 'brodtekst':
        return <Paragraph>{textComponent}</Paragraph>
      case 'mikrotekst':
        return <Text small>{textComponent}</Text>
      default:
        return <p>{textComponent}</p>
    }
  }

  return <div className={inLayout ? '' : 'row'}>{renderText()}</div>
}

RichText.propTypes = {
  text: PropTypes.string.isRequired,
  textType: PropTypes.string.isRequired,
  inLayout: PropTypes.bool.isRequired,
}

export default (props) => <RichText {...props} />
