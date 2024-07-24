import React from 'react'
import Table, { TableHead, TableBody, TableFooter, TableRow, TableCell } from '@statisticsnorway/ssb-component-library'

function NewTable() {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Header 1</TableCell>
          <TableCell>Header 2</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Body 1</TableCell>
          <TableCell>Body 2</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Footer 1</TableCell>
          <TableCell>Footer 2</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}

export default NewTable
