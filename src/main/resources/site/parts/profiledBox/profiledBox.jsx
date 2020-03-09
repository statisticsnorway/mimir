import React from 'react'
import { Card, Paragraph } from '@statisticsnorway/ssb-component-library'

export default (props) => <div className="w-100">
  <Card {...props} image={<img src={props.imgUrl} alt={props.imageAltText} />}>
    <Paragraph {...props}>{props.preambleText}</Paragraph>
  </Card>
</div>
