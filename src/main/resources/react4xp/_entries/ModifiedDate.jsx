import React from 'react'
import { Glossary } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { sanitize } from '/lib/ssb/utils/htmlUtils'

const ModifiedDate = (props) => {
  return (
    <React.Fragment>
      <Glossary className={props.className} explanation={props.explanation}>
        <span
          dangerouslySetInnerHTML={{
            __html: sanitize(props.children),
          }}
        />
      </Glossary>
    </React.Fragment>
  )
}

ModifiedDate.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  explanation: PropTypes.string,
}

export default ModifiedDate
