import React from 'react'
import PropTypes from 'prop-types'
import '@statisticsnorway/ssb-component-library'

const RichText = ({ text, textType }) => {
  const divStyle = { maxWidth: 'none' }
  const processedText = text.replace(
    /<p(\sstyle="text-align:\s*(center|right|left|justify);?")?>(.*?)<\/p>/g,
    (match, styleAttr, textAlign, innerHtml) => {
      if (textAlign) {
        divStyle.textAlign = textAlign
      }
      return `<span>${innerHtml}</span>`
    }
  )

  const textElement = <div style={divStyle} dangerouslySetInnerHTML={{ __html: processedText }} />
  switch (textType) {
    case 'ingress':
      return React.cloneElement(textElement, { className: 'ssb-lead-paragraph' })
    case 'brodtekst':
      return React.cloneElement(textElement, { className: 'ssb-paragraph' })
    case 'mikrotekst':
      return React.cloneElement(textElement, { className: 'ssb-text-wrapper small-text' })
    default:
      return textElement
  }
}
RichText.propTypes = {
  text: PropTypes.string.isRequired,
  textType: PropTypes.string.isRequired,
}
export default (props) => <RichText {...props} />
