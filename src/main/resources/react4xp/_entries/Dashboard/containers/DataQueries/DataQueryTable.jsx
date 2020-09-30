import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { Table } from 'react-bootstrap'
import { selectDataQueriesByType } from './selectors'
import { Accordion } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

export function DataQueryTable(props) {
  const dataQueries = useSelector(selectDataQueriesByType(props.dataQueryType))

  return (
    <Accordion
      header={`${props.header} (${dataQueries.length})`}
      className="mx-0"
      openByDefault={!!props.openByDefault}
    >
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
          {dataQueries.map((q) => {
            return (
              <tr key={q.id} className="small">
                <td>{q.displayName}</td>
                <td>
                  { q.dataset.modifiedReadable ? q.dataset.modifiedReadable : ''}<br/>
                  { q.dataset.modified ? q.dataset.modified : ''}
                </td>
                <td>refresh</td>
              </tr>
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
