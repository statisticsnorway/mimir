import React from 'react'
import PropTypes from 'prop-types'
import { DataQueryBadges } from './DataQueryBadges'
import { Link } from '@statisticsnorway/ssb-component-library'
import { Button, OverlayTrigger, Popover } from 'react-bootstrap'
import { AlertTriangle, RefreshCw } from 'react-feather'

export function DataQuery(props) {
  const {
    dataQuery: {
      dataset,
      displayName,
      hasData,
      id,
      type: contentType,
      format,
      isPublished,
      loading,
      logData,
      loadingLogs,
      eventLogNodes
    },
    onRefresh,
    onOpenEventLogData,
    contentStudioBaseUrl
  } = props

  function renderLogData() {
    if (logData) {
      return (
        <td>
          {eventLogNodes &&
        <OverlayTrigger
          trigger="click"
          key={id}
          placement="bottom"
          onToggle={(opening) => {
            if (opening) {
              onOpenEventLogData()
            }
          }}
          overlay={
            <Popover id={`popover-positioned-${id}`}>
              <Popover.Title as="h3">Logg detaljer</Popover.Title>
              <Popover.Content className="ssbPopoverBody">
                {renderJobLogs()}
              </Popover.Content>
            </Popover>
          }
        >
          <span className="haveList">{logData.message ? logData.message : ''}</span>
        </OverlayTrigger>
          }
          {logData.showWarningIcon && <span className="warningIcon"><AlertTriangle size="12" color="#FF4500"/></span>}<br/>
          {logData.modifiedReadable ? logData.modifiedReadable : ''}<br/>
          {logData.modified ? logData.modified : ''}<br/>
          {logData.by && logData.by.displayName ? `av ${logData.by.displayName}` : '' }
        </td>
      )
    } else return <td>no logs</td>
  }

  function renderJobLogs() {
    if (loadingLogs === true) {
      return (
        <span className="spinner-border spinner-border" />
      )
    } else {
      return eventLogNodes.map((logNode, index) => {
        return (
          <p key={index}>
            <span>{logNode.modifiedTs}</span> - <span>{logNode.by}</span><br/>
            <span> &gt; {logNode.result}</span>
          </p>
        )
      })
    }
  }

  return (
    <tr key={id} className="small">
      <td className={`${hasData ? 'ok' : 'error'} dataset`}>
        <Link isExternal href={contentStudioBaseUrl + id}>{displayName}</Link>
        <DataQueryBadges contentType={contentType} format={format} isPublished={isPublished}/>
      </td>
      <td>
        {dataset.modifiedReadable ? dataset.modifiedReadable : ''}
        <br />
        {dataset.modified ? dataset.modified : ''}
      </td>
      {logData ? renderLogData() : <td></td>}
      <td>
        <Button variant="primary"
          size="sm"
          className="mx-1"
          onClick={onRefresh}
        >
          { loading ? <span className="spinner-border spinner-border-sm" /> : <RefreshCw size={16}/> }
        </Button>
      </td>
    </tr>
  )
}

DataQuery.propTypes = {
  dataQuery: PropTypes.object,
  onRefresh: PropTypes.func,
  onOpenEventLogData: PropTypes.func,
  contentStudioBaseUrl: PropTypes.string
}
