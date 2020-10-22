import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { DataQueryBadges } from './DataQueryBadges'
import { Link } from '@statisticsnorway/ssb-component-library'
import { Button, Modal } from 'react-bootstrap'
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
    contentStudioBaseUrl,
    dataToolBoxBaseUrl
  } = props

  const [show, setShow] = useState(false)
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const openEventlog = () => {
    onOpenEventLogData()
    setShow(handleShow)
  }

  const openToolBox = () => {
    window.open(dataToolBoxBaseUrl + id)
  }

  function renderLogData() {
    if (logData) {
      return (
        <td className="text-center haveList" onClick={() => openEventlog()}>
          <span>
            {logData.message ? logData.message : ''}
            {logData.showWarningIcon && <span className="warningIcon"><AlertTriangle size="12" color="#FF4500"/></span>}<br/>
            {logData.modifiedReadable ? logData.modifiedReadable : ''}<br/>
            {logData.modified ? logData.modified : ''}<br/>
            {logData.by && logData.by.displayName ? `av ${logData.by.displayName}` : '' }
          </span>
        </td>
      )
    } else return <td>no logs</td>
  }

  const ModalContent = () => {
    return (
      <Modal
        show={show}
        onHide={handleClose}
        animation={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Logg detaljer
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3>{displayName}</h3>
          {renderJobLogs()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="info" onClick={openToolBox}>Datatoolbox</Button>
          <Button variant="secondary" onClick={handleClose}>Lukk</Button>
        </Modal.Footer>
      </Modal>
    )
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
      {show ? <ModalContent/> : null }
    </tr>
  )
}

DataQuery.propTypes = {
  dataQuery: PropTypes.object,
  onRefresh: PropTypes.func,
  onOpenEventLogData: PropTypes.func,
  contentStudioBaseUrl: PropTypes.string,
  dataToolBoxBaseUrl: PropTypes.string
}
