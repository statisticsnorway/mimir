import React from 'react'
import { LeadParagraph, Text, Paragraph } from '@statisticsnorway/ssb-component-library'
import { sanitize } from '../../../lib/ssb/utils/htmlUtils'

interface RichTextProps {
  text: string
  textType: string
  inLayout: boolean
}

const RichText = ({ text, textType, inLayout }: RichTextProps) => {
  const renderText = () => {
    const textComponent = <span dangerouslySetInnerHTML={{ __html: sanitize(text) }} />
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

export default (props: RichTextProps) => <RichText {...props} />
