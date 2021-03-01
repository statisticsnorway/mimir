import React from 'react'
import PropTypes from 'prop-types'
import { Col, Container, Row } from 'react-bootstrap'
import { Link } from '@statisticsnorway/ssb-component-library'

class EntryLinks extends React.Component {
  render() {
    const {
      headerTitle, entryLinks
    } = this.props

    return (
      <Container className="mt-4 mb-5">
        <Row>
          <Col lg="12">
            <h2>{headerTitle}</h2>
          </Col>
          {entryLinks.map(({
            title, href, icon, altText
          }, index) => {
            return (
              <Col
                key={`entry-link-${index}`} lg="3" className="p-0 mt-3">
                <Row className="d-flex justify-content-center">
                  <Col lg="4">
                    <img src={icon} alt={altText} />
                  </Col>
                  <Col lg="12" className="mt-4 text-center">
                    <Link
                      href={href}
                      linkType="header">
                      {title}
                    </Link>
                  </Col>
                </Row>
              </Col>
            )
          })}
        </Row>
      </Container>
    )
  }
}

EntryLinks.propTypes = {
  headerTitle: PropTypes.string,
  entryLinks: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      altText: PropTypes.string
    })
  ).isRequired
}

export default (props) => <EntryLinks {...props} />
