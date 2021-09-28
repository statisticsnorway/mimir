import React from 'react'
import { Link } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

class HeaderLink extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <section className="headerLinkDownload">
        <Link href={this.props.linkedContent} isExternal={true} className="ssb-link header">
          {this.props}
        </Link>
      </section>
    )
  }
}

export default (props) => <HeaderLink {...props} />

HeaderLink.propTypes = {
  content: PropTypes.string
}
