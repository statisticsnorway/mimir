import React from 'react'
import { Card, Paragraph } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

class ProfiledBox extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="w-100">
        <Card {...this.props} image={<img src={this.props.imgUrl} alt={this.props.imageAltText} />}>
          <Paragraph
            className={`preambleText${this.props.titleSize ? ` title-size-${this.props.titleSize}` : ''}`}
            {...this.props}
          >
            {this.props.preambleText}
          </Paragraph>
        </Card>
      </div>
    )
  }
}

ProfiledBox.propTypes = {
  imgUrl: PropTypes.string,
  imageAltText: PropTypes.string,
  titleSize: PropTypes.string,
  preambleText: PropTypes.string
}

export default (props) => <ProfiledBox {...props} />
