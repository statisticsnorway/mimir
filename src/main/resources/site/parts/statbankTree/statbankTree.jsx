import { Accordion, NestedAccordion } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import React from "react";

function StatBankTree(props){

  function renderSubSubjects(subSubject) {
    return (<NestedAccordion header={subSubject.title}>
      some content
    </NestedAccordion>)
  }

  function renderMainSubjects(mainSubject) {
    return (<Accordion header={mainSubject.title}>
      { mainSubject.subSubjects.map((subSubject) => renderSubSubjects(subSubject)) }
    </Accordion>)
  }

  return (
    <section>
      { props.mainSubjects.map((mainSubject) => renderMainSubjects(mainSubject))}
    </section>
  )
}

StatBankTree.PropTypes = {
  mainSubjects: PropTypes.arrayOf({
    title: PropTypes.string,
    subjectCode: PropTypes.string,
    path: PropTypes.string,
    language: PropTypes.string,
    name: PropTypes.string,
    subSubjects: PropTypes.arrayOf({
      title: PropTypes.string,
      subjectCode: PropTypes.string,
      path: PropTypes.string,
      language: PropTypes.string,
      name: PropTypes.string,
    })
  })
}

export default (props) => <StatBankTree {...props}/>
