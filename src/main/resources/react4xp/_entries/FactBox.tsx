import React from 'react'
import { FactBox as FactBoxComponent } from '@statisticsnorway/ssb-component-library'

interface FactBoxProps {
  header?: string;
  text?: string;
}

const FactBox = (props: FactBoxProps) => {
  const createText = (text) => (
    <div
      dangerouslySetInnerHTML={{
        __html: text,
      }}
    ></div>
  )

  return <FactBoxComponent header={props.header} text={createText(props.text)}></FactBoxComponent>
}

export default FactBox
