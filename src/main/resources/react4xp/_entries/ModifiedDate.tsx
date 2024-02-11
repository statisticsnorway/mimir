import React from 'react'
import { Glossary } from '@statisticsnorway/ssb-component-library'

interface ModifiedDateProps {
  children?: React.ReactNode;
  className?: string;
  explanation?: string;
}

const ModifiedDate = (props: ModifiedDateProps) => {
  return (
    <React.Fragment>
      <Glossary className={props.className} explanation={props.explanation}>
        <span
          dangerouslySetInnerHTML={{
            __html: props.children,
          }}
        />
      </Glossary>
    </React.Fragment>
  )
}

export default ModifiedDate
