import React from 'react'
import { Glossary } from '@statisticsnorway/ssb-component-library'
import { sanitize } from '../../lib/ssb/utils/htmlUtils'

interface ModifiedDateProps {
  children: string
  className?: string
  explanation?: string
}

const ModifiedDate = (props: ModifiedDateProps) => {
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

export default (props: ModifiedDateProps) => <ModifiedDate {...props} />
