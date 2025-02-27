import React from 'react'
import { Text } from '@statisticsnorway/ssb-component-library'

interface RichTextProps {
  text: string
  textType: string
  inLayout: boolean
}

const RichText = ({ text, textType, inLayout }: RichTextProps) => {
  const renderText = () => {
    // Text is sanitized in ts file
    const textComponent = <span dangerouslySetInnerHTML={{ __html: text }} />
    switch (textType) {
      case 'ingress':
        return <div className='rich-text-lead-paragraph'>{textComponent}</div>
      case 'brodtekst':
        return <div className='rich-text-paragraph'>{textComponent}</div>
      case 'mikrotekst':
        return <Text small>{textComponent}</Text>
      default:
        return <p>{textComponent}</p>
    }
  }

  return <div className={inLayout ? '' : 'row'}>{renderText()}</div>
}

export default (props: RichTextProps) => <RichText {...props} />
