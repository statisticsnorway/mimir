import { Accordion, NestedAccordion, Link } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import React from 'react'

function StatbankSubjectTree(props) {
  function renderStatisticLink(statistic) {
    return (
      <li>
        <Link href={props.statbankBaseUrl + statistic.url}>{statistic.title}</Link>
      </li>
    )
  }

  function renderSubSubjects(subSubject) {
    return (
      <NestedAccordion header={subSubject.title}>
        <ol className='statbank-list'>{subSubject.statistics.map((statistic) => renderStatisticLink(statistic))}</ol>
      </NestedAccordion>
    )
  }

  function renderMainSubjects(mainSubject) {
    return (
      <Accordion header={mainSubject.title}>
        {mainSubject.subSubjects.map((subSubject) => renderSubSubjects(subSubject))}
      </Accordion>
    )
  }

  return (
    <section className='statbank-subject-tree'>
      {props.mainSubjects.map((mainSubject) => renderMainSubjects(mainSubject))}
    </section>
  )
}

StatbankSubjectTree.propTypes = {
  statbankBaseUrl: PropTypes.string,
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
      statistics: PropTypes.arrayOf({
        title: PropTypes.string,
        url: PropTypes.string,
      }),
    }),
  }),
}

export default (props) => <StatbankSubjectTree {...props} />
