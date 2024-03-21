import React from 'react'
import { Accordion as AccordionComponent, NestedAccordion } from '@statisticsnorway/ssb-component-library'

import { sanitize } from '../../lib/ssb/utils/htmlUtils'
import { type AccordionData, type AccordionProps } from '../../lib/types/partTypes/accordion'

class Accordion extends React.Component<AccordionProps> {
  renderNestedAccordions(items: AccordionData['items']) {
    return items!.map((item, i) => (
      <NestedAccordion key={i} header={item.title}>
        {item.body && <div dangerouslySetInnerHTML={this.createMarkup(item.body)} />}
      </NestedAccordion>
    ))
  }

  createMarkup(html: string) {
    return {
      __html: sanitize(html.replace(/&nbsp;/g, ' ')),
    }
  }

  render() {
    const location = window.location
    const anchor = location && location.hash !== '' ? location.hash.substr(1) : undefined

    const { accordions } = this.props

    return (
      <section className='xp-part part-accordion container'>
        <div className='row'>
          {accordions.map((accordion, index) => (
            <React.Fragment key={index}>
              <AccordionComponent
                className='col-12'
                id={accordion.id}
                header={accordion.open}
                subHeader={accordion.subHeader}
                openByDefault={anchor && accordion.id && accordion.id === anchor}
              >
                {accordion.body && <div dangerouslySetInnerHTML={this.createMarkup(accordion.body)} />}
                {this.renderNestedAccordions(accordion.items)}
              </AccordionComponent>
            </React.Fragment>
          ))}
        </div>
      </section>
    )
  }
}

export default Accordion
