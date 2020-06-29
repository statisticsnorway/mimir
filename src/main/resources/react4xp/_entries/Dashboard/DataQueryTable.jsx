import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Table from 'react-bootstrap/Table'
import { ChevronDown, ChevronUp } from 'react-feather'
import { sort } from 'ramda'

const compareDateValues = (d1, d2) => {
  const d1val = new Date(d1).valueOf()
  const d2val = new Date(d2).valueOf()

  // use JS arithmetic on boolean
  return ((d1val > d2val) - (d1val < d2val))
}

const compareDates = (dq1, dq2, dateExtractor, order) => {
  const d1 = dateExtractor(dq1)
  const d2 = dateExtractor(dq2)

  if (d1) {
    return order * (d2 ? compareDateValues(d1, d2) : 1)
  } else {
    return d2 ? (order * -1) : 0
  }
}

const SortFields = {
  LAST_UPDATED: 'lastUpdated',
  TITLE: 'title',
  LAST_ACTIVITY: 'lastActivity'
}

const SortFunctions = {
  [SortFields.LAST_UPDATED]: (order) => (q1, q2) =>
    compareDates(q1, q2, (dq) => dq.dataset && dq.dataset.modified, order),
  [SortFields.TITLE]: (order) => (q1, q2) =>
    order * `${q1.displayName}`.localeCompare(`${q2.displayName}`),
  [SortFields.LAST_ACTIVITY]: (order) => (q1, q2) =>
    compareDates(q1, q2, (dq) => dq.logData && dq.logData.modifiedTs, order)
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
    sort((SortFunctions[SortFields.LAST_UPDATED])(SortOrder.ASCENDING), queries)
  )

  useEffect(() => {
    if (currSort && currOrder) {
      setSorted(
        sort((SortFunctions[currSort])(currOrder), queries)
      )
    }
  }, [currSort, currOrder])

  const sortQueries = (field, order) => {
    setCurrSort(field)
    setCurrOrder(order)
  }

  return (
    <Table bordered striped>
      <thead>
        <tr>
          <th className="roboto-bold sortable-column">
            <div className="sortable-column-header">
              <span>Spørring</span>
              {currOrder === SortOrder.ASCENDING ?
                <ChevronUp onClick={() => {
                  sortQueries(SortFields.TITLE, SortOrder.DESCENDING)
                }} /> :
                <ChevronDown onClick={() => {
                  sortQueries(SortFields.TITLE, SortOrder.ASCENDING)
                }} />
              }
            </div>
          </th>
          <th className="roboto-bold sortable-column">
            <div className="sortable-column-header">
              <span>Sist oppdatert</span>
              {currOrder === SortOrder.ASCENDING ?
                <ChevronUp onClick={() => {
                  sortQueries(SortFields.LAST_UPDATED, SortOrder.DESCENDING)
                }} /> :
                <ChevronDown onClick={() => {
                  sortQueries(SortFields.LAST_UPDATED, SortOrder.ASCENDING)
                }} />
              }
            </div>
          </th>
          <th className="roboto-bold sortable-column">
            <div className="sortable-column-header">
              <span>Siste aktivitet</span>
              {currOrder === SortOrder.ASCENDING ?
                <ChevronUp onClick={() => {
                  sortQueries(SortFields.LAST_ACTIVITY, SortOrder.DESCENDING)
                }} /> :
                <ChevronDown onClick={() => {
                  sortQueries(SortFields.LAST_ACTIVITY, SortOrder.ASCENDING)
                }} />
              }
            </div>
          </th>
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
