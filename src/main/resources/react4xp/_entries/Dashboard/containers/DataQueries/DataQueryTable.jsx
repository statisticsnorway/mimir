import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { Button, Table } from 'react-bootstrap'
import { selectDataQueriesByParentType } from './selectors'
import { Accordion } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { requestDatasetUpdate, requestEventLogData } from './actions'
import { DataQuery } from '../../components/DataQuery'
import { RefreshCw } from 'react-feather'
import { selectContentStudioBaseUrl, selectDataToolBoxBaseUrl } from '../HomePage/selectors'

export function DataQueryTable(props) {
  const dataQueries = useSelector(selectDataQueriesByParentType(props.dataQueryType))
  const contentStudioBaseUrl = useSelector(selectContentStudioBaseUrl)
  const dataToolBoxBaseUrl = useSelector(selectDataToolBoxBaseUrl)
  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()

  function updateAll() {
    const ids = dataQueries.filter((q) => !q.loading).map((q) => q.id)
    requestDatasetUpdate(dispatch, io, ids)
  }

  const anyLoading = dataQueries.filter((q) => q.loading).length > 0
  return (
    <Accordion header={`${props.header} (${dataQueries.length})`} className="mx-0" openByDefault={!!props.openByDefault}>
      <Button className="mb-3" onClick={() => updateAll()}>
        Oppdater liste
        {anyLoading ? <span className="spinner-border spinner-border-sm ml-2 mb-1" /> : <RefreshCw className="ml-2" />}
      </Button>
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
                contentStudioBaseUrl={contentStudioBaseUrl}
                dataToolBoxBaseUrl={dataToolBoxBaseUrl}
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
