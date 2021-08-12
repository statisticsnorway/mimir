import React from 'react'
import PropTypes from 'prop-types'
import { Card, Text } from '@statisticsnorway/ssb-component-library'

const ExternalCards = (props) => {
  return (
    <React.Fragment>
      <div className="container">
        <div className="row justify-content-start">
          {props.links.map((link, index) => {
            return (
              <Card
                className="external-card col-12 mb-4 col-md-4"
                key={index}
                href={link.href}
                hrefText={link.children}
                icon={link.image && <img src={link.image} alt=''/>}
                profiled external
              >
                <Text>{link.content}</Text>
              </Card>
            )
          }
          )}
        </div>
      </div>
    </React.Fragment>
  )
}

ExternalCards.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      image: PropTypes.string,
      imageAlt: PropTypes.string,
      content: PropTypes.string,
      href: PropTypes.string.isRequired,
      children: PropTypes.string
    })
  )
}

export default ExternalCards
