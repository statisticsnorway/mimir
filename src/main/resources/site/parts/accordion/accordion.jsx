import React from 'react'
import { Accordion as AccordionComponent, NestedAccordion } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

class Accordion extends React.Component {
  constructor(props) {
    super(props)
  }

  renderNestenAccordions(items) {
    return (
      items.map((item, i) =>
        <NestedAccordion key={i} header={item.title}>
          <div dangerouslySetInnerHTML={this.createMarkup(item.body)}/>
        </NestedAccordion>
      )
    )
  }

  createMarkup(html) {
    return {
      __html: html
    }
  }

  render() {
    const anchor = window.location.hash.substr(1);
    const {
      accordions
    } = this.props
    return (
      <section className="xp-part part-accordion container">
        {
          accordions.map((accordion, index) =>
            <AccordionComponent
              id={accordion.id}
              key={index}
              header={accordion.open}
              openByDefault={accordion.id && accordion.id === anchor}
            >
              <div dangerouslySetInnerHTML={this.createMarkup(accordion.body)}></div>
              {this.renderNestenAccordions(accordion.items)}
            </AccordionComponent>
          )}
      </section>
    )
  }
}

Accordion.propTypes = {
  accordions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      open: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          title: PropTypes.string.isRequired,
          body: PropTypes.string.isRequired
        })
      )
    })
  )
}

export default (props) => <Accordion {...props} />
