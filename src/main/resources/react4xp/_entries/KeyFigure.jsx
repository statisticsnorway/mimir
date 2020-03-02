import React from 'react'
import { KeyFigures } from '@statisticsnorway/ssb-component-library'

export default (props) => <KeyFigures {...props}
  icon={props.iconUrl && <img src={props.iconUrl} alt={props.iconAltText}></img>}
/>
