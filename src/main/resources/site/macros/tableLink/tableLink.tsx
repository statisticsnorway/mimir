import React from 'react'
import { TableLink as SSBTableLink } from '@statisticsnorway/ssb-component-library'

interface TableLinkProps {
  href: string;
  description: string;
  title?: string;
  isExternal?: boolean;
}

const TableLink = (props: TableLinkProps) => <SSBTableLink href={props.href} description={props.description} text={props.title} />

export default TableLink
