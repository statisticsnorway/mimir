import React from 'react'
import PropTypes from 'prop-types'
import { LeadParagraph, Paragraph, Text } from '@statisticsnorway/ssb-component-library'

const RichText = ({ text, textType }) => {
  const renderText = () => {
    const processedText = text.replace(/<(\/*)p>/gm, '<$1span>')

    switch (textType) {
      case 'ingress':
        return (
          <LeadParagraph>
            <div
              dangerouslySetInnerHTML={{
                __html: processedText,
              }}
            />
          </LeadParagraph>
        )
      case 'brodtekst':
        return (
          <Paragraph>
            <div
              dangerouslySetInnerHTML={{
                __html: processedText,
              }}
            />
          </Paragraph>
        )
      case 'mikrotekst':
        return (
          <Text small>
            <div
              dangerouslySetInnerHTML={{
                __html: processedText,
              }}
            />
          </Text>
        )
      default:
        return <span dangerouslySetInnerHTML={{ __html: processedText }} />
    }
  }

  return <div>{text ? renderText() : <span>Please provide text content.</span>}</div>
}

RichText.propTypes = {
  text: PropTypes.string.isRequired,
  textType: PropTypes.string.isRequired,
}

export default (props) => <RichText {...props} />
