import React from 'react'
import { Card, Paragraph } from '@statisticsnorway/ssb-component-library'
import { ProfiledBoxProps } from '../../../lib/types/partTypes/profiledBox'

class ProfiledBox extends React.Component<ProfiledBoxProps> {
  constructor(props: ProfiledBoxProps) {
    super(props)
  }

  render() {
    return (
      <Card {...this.props} image={<img src={this.props.imgUrl} alt={this.props.imageAltText} aria-hidden='true' />}>
        <Paragraph
          className={`preambleText${this.props.titleSize ? ` title-size-${this.props.titleSize}` : ''}`}
          {...this.props}
        >
          {this.props.preambleText}
        </Paragraph>
      </Card>
    )
  }
}

export default (props: ProfiledBoxProps) => <ProfiledBox {...props} />
