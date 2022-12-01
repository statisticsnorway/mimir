import React from 'react'
import { FactBox as FactBoxComponent } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

const FactBox = (props) => {
  const createText = (text) => (
    <div
      dangerouslySetInnerHTML={{
        __html: text,
      }}
    ></div>
  )

  return (
    <section className='xp-part part-fact-box container'>
      <FactBoxComponent header={props.header} text={createText(props.text)}></FactBoxComponent>
    </section>
  )
}

FactBox.propTypes = {
  header: PropTypes.string,
  text: PropTypes.string,
}

export default FactBox
