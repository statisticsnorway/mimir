import React from 'react'
import { Accordion as AccordionComponent, NestedAccordion } from '@statisticsnorway/ssb-component-library'

import PropTypes from 'prop-types'

class Accordion extends React.Component {
  renderNestedAccordions(items) {
    return (
      items.map((item, i) =>
        <NestedAccordion key={i} header={item.title}>
          <div dangerouslySetInnerHTML={item.body ? this.createMarkup(item.body) : ''}/>
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
    const location = window.location
    const anchor = location && location.hash !== '' ? location.hash.substr(1) : undefined

    const {
      accordions
    } = this.props

    return (
      <section className="xp-part part-accordion container">
        <div className="row">
          {
            accordions.map((accordion, index) =>
              <React.Fragment key={index}>
                <AccordionComponent
                  className="col-12"
                  id={accordion.id}
                  header={accordion.open}
                  subHeader={accordion.subHeader}
                  openByDefault={anchor && accordion.id && accordion.id === anchor}
                >
                  <div dangerouslySetInnerHTML={this.createMarkup(accordion.body)}></div>
                  {this.renderNestedAccordions(accordion.items)}
                </AccordionComponent>
              </React.Fragment>
            )}
        </div>
      </section>
    )
  }
}

Accordion.propTypes = {
  accordions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      open: PropTypes.string.isRequired,
      subHeader: PropTypes.string,
      body: PropTypes.string,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          title: PropTypes.string,
          body: PropTypes.string
        })
      )
    })
  )
}

export default (props) => <Accordion {...props} />
