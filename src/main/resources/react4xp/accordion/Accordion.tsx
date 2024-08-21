import React from 'react'
import { Accordion as AccordionComponent, NestedAccordion } from '@statisticsnorway/ssb-component-library'

import { type AccordionData, type AccordionItems, type AccordionProps } from '../../lib/types/partTypes/accordion'
import { sanitize } from '../../lib/ssb/utils/htmlUtils'

function Accordion(props: AccordionProps) {
  const { accordions } = props

  function renderNestedAccordions(items: AccordionData['items']) {
    return (items as AccordionProps['accordions'])!.map((item, i) => (
      <NestedAccordion key={i} header={(item as AccordionItems).title}>
        {item.body && <div dangerouslySetInnerHTML={createMarkup(item.body)} />}
      </NestedAccordion>
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
          <AccordionComponent
            key={index}
            className='col-12'
            id={accordion.id}
            header={accordion.open}
            subHeader={accordion.subHeader}
            openByDefault={anchor && accordion.id && accordion.id === anchor}
          >
            {accordion.body && <div dangerouslySetInnerHTML={createMarkup(accordion.body)} />}
            {renderNestedAccordions(accordion.items)}
          </AccordionComponent>
        ))}
      </div>
    </section>
  )
}

export default Accordion
