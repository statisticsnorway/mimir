import React from 'react'
import { Accordion, NestedAccordion } from '@statisticsnorway/ssb-component-library'

function createMarkup(html) {
  return {
    __html: html
  }
}

export default (props) =>
  <div>
    {props.accordions.map((accordion) =>
      <Accordion key={accordion.id} header={accordion.open}>
        <div dangerouslySetInnerHTML={createMarkup(accordion.body)}/>
        {accordion.items.map((item, i) =>
          <NestedAccordion key={i.toString()} header={item.title}>
            <div dangerouslySetInnerHTML={createMarkup(item.body)}/>
          </NestedAccordion>)}
      </Accordion>
    )}
  </div>
