import React from 'react'
import { sanitize } from '/lib/ssb/utils/htmlUtils'

export default (props) => (
  <div
    dangerouslySetInnerHTML={{
      __html: sanitize(props.markdownRendered),
    }}
  />
)
