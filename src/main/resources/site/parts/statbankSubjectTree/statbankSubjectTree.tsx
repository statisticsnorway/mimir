import { Accordion, NestedAccordion, Link } from '@statisticsnorway/ssb-component-library'
import React from 'react'

interface StatbankSubjectTreeProps {
  statbankBaseUrl?: string;
  mainSubjects?: unknown[];
}

function StatbankSubjectTree(props: StatbankSubjectTreeProps) {
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

export default (props) => <StatbankSubjectTree {...props} />
