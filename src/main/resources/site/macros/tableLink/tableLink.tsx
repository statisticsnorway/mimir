import React from 'react'
import { TableLink as SSBTableLink } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

const TableLink = (props) => <SSBTableLink href={props.href} description={props.description} text={props.title} />

TableLink.propTypes = {
  href: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  title: PropTypes.string,
  isExternal: PropTypes.bool,
}

export default TableLink
