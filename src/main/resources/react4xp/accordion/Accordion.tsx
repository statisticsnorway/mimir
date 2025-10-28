import React from 'react'
//import { Accordion as AccordionComponent, NestedAccordion } from '@statisticsnorway/ssb-component-library'

import { Details } from '@digdir/designsystemet-react'
import { type AccordionData, type AccordionItems, type AccordionProps } from '/lib/types/partTypes/accordion'
import { sanitize } from '/lib/ssb/utils/htmlUtils'

const Accordion = (props: AccordionProps) => {
  const { accordions } = props

  /* function renderNestedAccordions(items: AccordionData['items']) {
    return (items as AccordionProps['accordions'])!.map((item, i) => (
      <NestedAccordion key={`accordion-${(item as AccordionItems).title}-${i}`} header={(item as AccordionItems).title}>
        {item.body && <div dangerouslySetInnerHTML={createMarkup(item.body)} />}
      </NestedAccordion>
    ))
  } */

  function renderNestedDetails(items: AccordionData['items']) {
    return (items as AccordionProps['accordions'])!.map((item, i) => (
      <Details key={`accordion-${(item as AccordionItems).title}-${i}`}>
        <Details.Summary>{(item as AccordionItems).title}</Details.Summary>
        <Details.Content>{item.body && <div dangerouslySetInnerHTML={createMarkup(item.body)} />}</Details.Content>
      </Details>
    ))
  }

  function createMarkup(html: string) {
    return {
      __html: sanitize(html.replace(/&nbsp;/g, ' ')),
    }
  }

  const location = window.location
  const anchor = location && location.hash !== '' ? location.hash.slice(1) : undefined

  return (
    <section className='xp-part part-accordion container'>
      <div className='row'>
        {accordions.map((accordion, index) => (
          <Details
            key={`accordion-${accordion.open}-${index}`}
            id={accordion.id}
            defaultOpen={(anchor && accordion.id && accordion.id === anchor) || false}
          >
            <Details.Summary>{accordion.open}</Details.Summary>
            <Details.Content>
              {accordion.body && <div dangerouslySetInnerHTML={createMarkup(accordion.body)} />}
              {renderNestedDetails(accordion.items)}
            </Details.Content>
          </Details>
        ))}
      </div>
      {/* <AccordionComponent
            key={`accordion-${accordion.open}-${index}`}
            className='col-12'
            id={accordion.id}
            header={accordion.open}
            subHeader={accordion.subHeader}
            openByDefault={anchor && accordion.id && accordion.id === anchor}
          >
            {accordion.body && <div dangerouslySetInnerHTML={createMarkup(accordion.body)} />}
            {renderNestedAccordions(accordion.items)}
          </AccordionComponent> */}
    </section>
  )
}

export default Accordion
