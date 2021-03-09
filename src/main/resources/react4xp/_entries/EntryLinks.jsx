import React from 'react'
import PropTypes from 'prop-types'
import { Link } from '@statisticsnorway/ssb-component-library'

class EntryLinks extends React.Component {
  renderEntryLinks() {
    const {
      entryLinks
    } = this.props

    return entryLinks.map(({
      title, href, icon, altText
    }, index) => {
      return (
        <React.Fragment key={`entry-link-${index}`}>
          <div className="col-3 mt-4">
            <div className="row d-flex justify-content-center">
              <div className="col-4">
                <img src={icon} alt={altText ? altText : ' '} />
              </div>
              <div className="col-12 mt-4 text-center">
                <Link
                  href={href}
                  linkType="header">
                  {title}
                </Link>
              </div>
            </div>
          </div>
        </React.Fragment>
      )
    })
  }

  render() {
    const {
      headerTitle
    } = this.props

    return (
      <div className="container mt-4 mb-5">
        <div className="row">
          <div className="col-12">
            <h2>{headerTitle}</h2>
          </div>
          {this.renderEntryLinks()}
        </div>
      </div>
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
