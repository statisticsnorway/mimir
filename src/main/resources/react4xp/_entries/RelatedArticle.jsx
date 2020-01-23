import React from 'react'
import { Card } from '@statisticsnorway/ssb-component-library'
import { Text } from '@statisticsnorway/ssb-component-library'
import { Link } from '@statisticsnorway/ssb-component-library'
import { Paragraph } from '@statisticsnorway/ssb-component-library'

export default (props) => <Card {...props} image={<img src={props.imgUrl} alt="" />}>
  <Text {...props}>{props.content}</Text>
  <div className="pt-2 pb-3">
    <Link {...props}>{props.headerLink}</Link>
  </div>
  <Paragraph {...props}>{props.preambleText}</Paragraph>
</Card>
