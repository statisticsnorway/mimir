import React from 'react'
import { FactBox as FactBoxComponent } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { sanitize } from '/lib/ssb/utils/htmlUtils'

const FactBox = (props) => {
  const createText = (text) => (
    <div
      dangerouslySetInnerHTML={{
        __html: sanitize(text),
      }}
    ></div>
  )

  return <FactBoxComponent header={props.header} text={createText(props.text)}></FactBoxComponent>
}

FactBox.propTypes = {
  header: PropTypes.string,
  text: PropTypes.string,
}

export default FactBox
