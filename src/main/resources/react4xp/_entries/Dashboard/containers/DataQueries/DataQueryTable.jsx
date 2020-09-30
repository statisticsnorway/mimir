import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { Table } from 'react-bootstrap'
import { selectDataQueriesByType } from './selectors'
import { Accordion } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { requestDatasetUpdate, requestEventLogData } from './actions'
import { DataQuery } from '../../components/DataQuery'

export function DataQueryTable(props) {
  const dataQueries = useSelector(selectDataQueriesByType(props.dataQueryType))
  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()

  return (
    <Accordion header={`${props.header} (${dataQueries.length})`} className="mx-0" openByDefault={!!props.openByDefault}>
      <Table bordered striped>
        <thead>
          <tr>
            <th className="roboto-bold sortable-column">
              <div className="sortable-column-header">
                <span>Spørring</span>
              </div>
            </th>
            <th className="roboto-bold sortable-column">
              <div className="sortable-column-header">
                <span>Sist oppdatert</span>
              </div>
            </th>
            <th className="roboto-bold sortable-column">
              <div className="sortable-column-header">
                <span>Siste aktivitet</span>
              </div>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {dataQueries.map((dataQuery) => {
            return (
              <DataQuery
                key={dataQuery.id}
                dataQuery={dataQuery}
                onRefresh={() => requestDatasetUpdate(dispatch, io, [dataQuery.id])}
                onOpenEventLogData={() => requestEventLogData(dispatch, io, dataQuery.id)}
              />
            )
          })}
        </tbody>
      </Table>
    </Accordion>
  )
}

DataQueryTable.propTypes = {
  dataQueryType: PropTypes.string,
  header: PropTypes.string,
  openByDefault: PropTypes.bool
}

export default (props) => <DataQueryTable {...props} />
