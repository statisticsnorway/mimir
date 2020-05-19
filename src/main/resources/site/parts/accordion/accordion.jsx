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
    const {
      accordions
    } = this.props
    return (
      <section className="xp-part part-accordion container">
        {
          accordions.map((accordion, index) =>
            <AccordionComponent key={index} header={accordion.open}>
              <div dangerouslySetInnerHTML={this.createMarkup(accordion.body)}/>
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
