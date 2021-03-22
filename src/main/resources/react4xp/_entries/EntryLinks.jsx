import React from 'react'
import PropTypes from 'prop-types'
import { Link } from '@statisticsnorway/ssb-component-library'

class EntryLinks extends React.Component {
  renderEntryLinks() {
    const {
      entryLinks
    } = this.props

    return entryLinks.map(({
      title, href, icon, mobileIcon, altText
    }, index) => {
      return (
        <React.Fragment key={`entry-link-${index}`}>
          <div className="col-md-3 mt-4 p-0">
            <div className="row text-left text-md-center ">
              <div className="col-md-12 col-auto align-items-end">
                <img src={icon} alt={altText ? altText : ' '} className="desktop-icons d-none d-md-inline" />
                <img src={mobileIcon} alt={altText ? altText : ' '} className="mobile-icons d-md-none" />
              </div>
              <div className="col-md-12 col-10 mt-md-4">
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
