import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { Button, OverlayTrigger, Popover, Table } from 'react-bootstrap'
import { selectDataQueriesByType } from './selectors'
import { Accordion, Link } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { AlertTriangle, RefreshCw } from 'react-feather'
import { requestDatasetUpdate, requestEventLogData } from './actions'

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

  function renderLogData(dataQuery) {
    const dataQueryId = dataQuery.id
    const logData = dataQuery.logData
    if (logData) {
      return (
        <td>
          {dataQuery.eventLogNodes &&
        <OverlayTrigger
          trigger="click"
          key={dataQueryId}
          placement="bottom"
          onToggle={(opening) => {
            if (opening) {
              requestEventLogData(dispatch, io, dataQueryId)
            }
          }}
          overlay={
            <Popover id={`popover-positioned-${dataQueryId}`}>
              <Popover.Title as="h3">Logg detaljer</Popover.Title>
              <Popover.Content className="ssbPopoverBody">
                {renderJobLogs(dataQuery)}
              </Popover.Content>
            </Popover>
          }
        >
          <span className="haveList">{logData.message ? logData.message : ''}</span>
        </OverlayTrigger>
          }
          {!logData.eventLogNodes && logData.message && <span>{logData.message}</span>}
          {logData.showWarningIcon && <span className="warningIcon"><AlertTriangle size="12" color="#FF4500"/></span>}<br/>
          {logData.modifiedReadable ? logData.modifiedReadable : ''}<br/>
          {logData.modified ? logData.modified : ''}<br/>
          {logData.by && logData.by.displayName ? `av ${logData.by.displayName}` : '' }
        </td>
      )
    } else return <td>no logs</td>
  }

  function renderJobLogs(dataQuery) {
    if (dataQuery.loadingLogs === true) {
      return (
        <span className="spinner-border spinner-border" />
      )
    } else {
      return dataQuery.eventLogNodes.map((logNode, index) => renderLogNode(index, logNode))
    }
  }

  function renderLogNode(i, logNode) {
    return (
      <p>
        <span>{logNode.modifiedTs}</span> - <span>{logNode.by}</span><br/>
        <span> &gt; {logNode.result}</span>
      </p>
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
              loading,
              logData
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
                {logData ? renderLogData(dataQuery) : <td></td>}
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
