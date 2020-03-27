import React from 'react'
import { Link } from '@statisticsnorway/ssb-component-library'
import { ArrowRight, ExternalLink } from 'react-feather'

export default (props) => <Link
  {...props}
  icon={props.hasIcon ? (props.iconType == 'arrowRight' ? <ArrowRight size="20" /> : <ExternalLink size="20" />) : undefined}
/>
