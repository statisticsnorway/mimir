import React from 'react'
import { TableLink as SSBTableLink } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

const TableLink = (props) => (<SSBTableLink href={props.href} hrefText={props.hrefText} title={props.title} isExternal={props.isExternal}/>)

TableLink.propTypes = {
  href: PropTypes.string.isRequired,
  hrefText: PropTypes.string.isRequired,
  title: PropTypes.string,
  isExternal: PropTypes.bool
}

export default TableLink
