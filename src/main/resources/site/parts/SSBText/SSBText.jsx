import React from 'react'
import PropTypes from 'prop-types'
import { LeadParagraph, Paragraph, Text } from '@statisticsnorway/ssb-component-library'

const SSBText = ({ text, textType }) => {
  const renderText = () => {
    const processedText = text.replace(/<(\/*)p>/gm, '<$1span>')

    switch (textType) {
      case 'ingress':
        return <LeadParagraph dangerouslySetInnerHTML={{ __html: processedText }} />
      case 'paragraph':
        return <Paragraph dangerouslySetInnerHTML={{ __html: processedText }} />
      case 'text':
        return <Text small dangerouslySetInnerHTML={{ __html: processedText }} />
      default:
        return <span dangerouslySetInnerHTML={{ __html: processedText }} />
    }
  }

  return <div>{text ? renderText() : <span>Please provide text content.</span>}</div>
}

SSBText.propTypes = {
  text: PropTypes.string.isRequired,
  textType: PropTypes.oneOf(['ingress', 'paragraph', 'text']).isRequired,
}

export default (props) => <SSBText {...props} />
