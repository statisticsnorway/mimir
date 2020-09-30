import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { Button, Table } from 'react-bootstrap'
import { selectDataQueriesByType } from './selectors'
import { Accordion, Link } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { RefreshCw } from 'react-feather'
import { requestDatasetUpdate } from './actions'

export function DataQueryTable(props) {
  const dataQueries = useSelector(selectDataQueriesByType(props.dataQueryType))
  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()

  function decideType(type) {
    switch (type) {
    case 'mimir:keyFigure':
      return 'keyfigureType'
    case 'mimir:highchart':
      return 'highchartsType'
    case 'mimir:table':
      return 'tableType'
    default:
      return ''
    }
  }

  function renderBadges(contentType, format, isPublished) {
    return (
      <React.Fragment>
        <span className={`float-right detail ${decideType(contentType)}`}>{contentType.split(':').pop()}</span>
        <span className={'float-right detail ' + format}>{format}</span>
        {!isPublished ? <span className={'float-right detail unpublished'}>Ikke publisert</span> : null}
      </React.Fragment>
    )
  }

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
            const {
              dataset,
              displayName,
              hasData,
              id,
              type: contentType,
              format,
              isPublished,
              loading
            } = dataQuery
            return (
              <tr key={id} className="small">
                <td className={`${hasData ? 'ok' : 'error'} dataset`}>
                  <Link isExternal href={/* this.props.contentStudioBaseUrl*/ '/' + id}>{displayName}</Link>
                  {renderBadges(contentType, format, isPublished)}
                </td>
                <td>
                  {dataset.modifiedReadable ? dataset.modifiedReadable : ''}
                  <br />
                  {dataset.modified ? dataset.modified : ''}
                </td>
                <td>logdata</td>
                <td>
                  <Button varitant="primary"
                    size="sm"
                    className="mx-1"
                    onClick={() => requestDatasetUpdate(dispatch, io, [id])}
                  >
                    { loading ? <span className="spinner-border spinner-border-sm" /> : <RefreshCw size={16}/> }
                  </Button>
                </td>
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
