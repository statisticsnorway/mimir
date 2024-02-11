import React from 'react'
import { useTable, useSortBy } from 'react-table'
import { Table } from 'react-bootstrap'
import { ChevronUp, ChevronDown } from 'react-feather'

interface ReactTableProps {
  columns?: unknown[];
  data?: unknown[];
}

export function ReactTable(props: ReactTableProps) {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns: props.columns,
      data: props.data,
    },
    useSortBy
  )

  return (
    <Table bordered striped {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup, index) => (
          <tr key={index} {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column, index) => (
              <th key={index} {...column.getHeaderProps(column.getSortByToggleProps())}>
                <span>
                  {column.render('Header')}
                  {column.disableSortBy ? (
                    ''
                  ) : column.isSorted ? (
                    column.isSortedDesc ? (
                      <ChevronDown size={12} />
                    ) : (
                      <ChevronUp size={12} />
                    )
                  ) : (
                    <span>
                      <ChevronUp size={12} />
                      <ChevronDown size={12} />
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, index) => {
          prepareRow(row)
          return (
            <tr key={index} {...row.getRowProps()} className='small'>
              {row.cells.map((cell, i) => {
                return (
                  <td key={i} {...cell.getCellProps} className={row.original.hasError ? 'error-row ' : ''}>
                    {cell.render('Cell')}
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
}

export default (props) => <ReactTable {...props} />
