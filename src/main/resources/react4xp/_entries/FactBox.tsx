import React from 'react'
import { ExpansionBox as FactBoxComponent } from '@statisticsnorway/ssb-component-library'
import { sanitize } from '/lib/ssb/utils/htmlUtils'

interface FactBoxProps {
  header?: string
  text: string
  expansionBoxType: string
}

const FactBox = (props: FactBoxProps) => {
  const createText = (text: string) => (
    <div
      dangerouslySetInnerHTML={{
        __html: sanitize(text),
      }}
    ></div>
  )

  return (
    <FactBoxComponent
      header={props.header}
      text={createText(props.text)}
      sneakPeek={props.expansionBoxType === 'sneakPeek' || props.expansionBoxType === 'aiIcon'}
      aiIcon={props.expansionBoxType === 'aiIcon'}
    />
  )
}

export default FactBox
