import React from 'react'
import { Accordion as AccordionComponent, NestedAccordion } from '@statisticsnorway/ssb-component-library'

interface AccordionProps {
  accordions?: {
    id?: string;
    open: string;
    subHeader?: string;
    body?: string;
    items?: {
      title?: string;
      body?: string;
    }[];
  }[];
}

class Accordion extends React.Component<AccordionProps> {
  renderNestedAccordions(items) {
    return items.map((item, i) => (
      <NestedAccordion key={i} header={item.title}>
        {item.body && <div dangerouslySetInnerHTML={this.createMarkup(item.body)} />}
      </NestedAccordion>
    ))
  }

  createMarkup(html) {
    return {
      __html: html.replace(/&nbsp;/g, ' '),
    };
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
