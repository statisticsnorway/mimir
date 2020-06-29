import React, { useState, useEffect } from 'react'
import Table from 'react-bootstrap/Table'
import { ChevronDown, ChevronUp } from 'react-feather'

const compareDates = (d1, d2) => {
  const d1val = new Date(d1).valueOf()
  const d2val = new Date(d2).valueOf()

  // use JS arithmetic on boolean
  return ((d1val > d2val) - (d1val < d2val))
}

const SortFields = {
  LAST_UPDATED: 'lastUpdated',
  TITLE: 'title',
  LAST_ACTIVITY: 'lastActivity'
}

const SortFunctions = {
  [SortFields.LAST_UPDATED]: (order) => (q1, q2) => {
    if (q1.dataset.modified) {
      return order * (q2.dataset.modified ?
        compareDates(q1.dataset.modified, q2.dataset.modified) :
        1)
    } else {
      return order * -1
    }
  },
  [SortFields.TITLE]: (q1, q2) =>
    `${q1.displayName}`.localeCompare(`${q2.displayName}`),
  [SortFields.LAST_ACTIVITY]: (q1, q2) =>
    `${q1.dataset.modifiedReadable}`.localeCompare(`${q2.dataset.modifiedReadable}`)
}

const SortOrder = {
  ASCENDING: 1,
  DESCENDING: -1
}

const DataQueryTable = ({
  queries, renderDataQueries
}) => {
  const [currSort, setCurrSort] = useState(SortFields.LAST_UPDATED)
  const [currOrder, setCurrOrder] = useState(SortOrder.ASCENDING)
  const [sorted, setSorted] = useState(
    queries.sort(SortFunctions[SortFields.LAST_UPDATED])(SortOrder.ASCENDING)
  )

  useEffect(() => {
    if (currSort && currOrder) {
      setSorted(queries.sort(SortFunctions[currSort])(currOrder))
    }
  }, [currSort, currOrder])

  const sort = (field, order) => {
    setCurrSort(field)
    setCurrOrder(order)
  }

  return (
    <Table bordered striped>
      <thead>
        <tr>
          <th className="roboto-bold">
            Spørring
            {currOrder === SortOrder.ASCENDING ?
              <ChevronUp onClick={() => {
                sort(SortFields.TITLE, SortOrder.DESCENDING)
              }} /> :
              <ChevronDown onClick={() => {
                sort(SortFields.TITLE, SortOrder.ASCENDING)
              }} />
            }
          </th>
          <th className="roboto-bold">
            Sist oppdatert
            {currOrder === SortOrder.ASCENDING ?
              <ChevronUp onClick={() => {
                sort(SortFields.LAST_UPDATED, SortOrder.DESCENDING)
              }} /> :
              <ChevronDown onClick={() => {
                sort(SortFields.LAST_UPDATED, SortOrder.ASCENDING)
              }} />
            }
          </th>
          <th className="roboto-bold">Siste aktivitet</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {renderDataQueries(sorted)}
      </tbody>
    </Table>
  )
}

DataQueryTable.propTypes = {
  queries: PropTypes.array.isRequired,
  renderDataQueries: PropTypes.func.isRequired
}

export default DataQueryTable
