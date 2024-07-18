import React from 'react'
import { ExpansionBox as FactBoxComponent } from '@statisticsnorway/ssb-component-library'
import { sanitize } from '../../lib/ssb/utils/htmlUtils'

interface FactBoxProps {
  header?: string
  text: string
  showSneakPeek: boolean
}

const FactBox = (props: FactBoxProps) => {
  const createText = (text: string) => (
    <div
      dangerouslySetInnerHTML={{
        __html: sanitize(text),
      }}
    ></div>
  )

  return <FactBoxComponent header={props.header} text={createText(props.text)} sneakPeek={props.showSneakPeek} />
}

export default FactBox
