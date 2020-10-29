import React, { useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { Button, Modal } from 'react-bootstrap'
import { selectDataQueriesByParentType } from './selectors'
import { Accordion, Link } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { requestDatasetUpdate, requestEventLogData } from './actions'
import { DataQuery } from '../../components/DataQuery'
import { AlertTriangle, RefreshCw } from 'react-feather'
import { selectContentStudioBaseUrl, selectDataToolBoxBaseUrl } from '../HomePage/selectors'
import { ReactTable } from '../../components/ReactTable'

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

  const columns = React.useMemo(() => [
    {
      Header: 'Spørring ',
      accessor: 'dataquery'
    },
    {
      Header: 'Sist oppdatert ',
      accessor: 'lastUpdated',
      sortType: 'datetime' // TODO: replace with function, retrieve only the date and sort by that
    },
    {
      Header: 'Siste aktivitet ',
      accessor: 'lastActivity',
      sortType: 'datetime' // TODO: replace with function, for now only sort by date of last activity
    },
    {
      Header: '',
      accessor: 'refreshDataQuery',
      disableSortBy: true
    }
  ], [])

  const [show, setShow] = useState(false)
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const openEventlog = (dataQuery) => {
    requestEventLogData(dispatch, io, dataQuery.id)
    setShow(handleShow)
  }

  function renderLogData(dataQuery) {
    if (dataQuery.logData) {
      return (
        <span className="text-center haveList" onClick={() => openEventlog(dataQuery)}>
          <span>
            {dataQuery.logData.message ? dataQuery.logData.message : ''}
            {dataQuery.logData.showWarningIcon && <span className="warningIcon"><AlertTriangle size="12" color="#FF4500"/></span>}<br/>
            {dataQuery.logData.modifiedReadable ? dataQuery.logData.modifiedReadable : ''}<br/>
            {dataQuery.logData.modified ? dataQuery.logData.modified : ''}<br/>
            {dataQuery.logData.by && dataQuery.logData.by.displayName ? `av ${dataQuery.logData.by.displayName}` : '' }
          </span>
        </span>
      )
    } else return <span>no logs</span>
  }

  const openToolBox = (dataQuery) => {
    window.open(dataToolBoxBaseUrl + dataQuery.id)
  }

  function renderJobLogs(dataQuery) {
    if (dataQuery.loadingLogs === true) {
      return (
        <span className="spinner-border spinner-border" />
      )
    } else {
      return dataQuery.eventLogNodes.map((logNode, index) => {
        return (
          <p key={index}>
            <span>{logNode.modifiedTs}</span> - <span>{logNode.by}</span><br/>
            <span> &gt; {logNode.result}</span>
          </p>
        )
      })
    }
  }

  // TODO: Implement ModalContent
  const ModalContent = (dataQuery) => {
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
          <h3>{dataQuery.displayName}</h3>
          {renderJobLogs(dataQuery)}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="info" onClick={openToolBox(dataQuery)}>Datatoolbox</Button>
          <Button variant="secondary" onClick={handleClose}>Lukk</Button>
        </Modal.Footer>
      </Modal>
    )
  }

  function getDataQueries(dataQueries) {
    return dataQueries.map((dataQuery) => {
      return {
        dataquery: (
          <span className={`${dataQuery.hasData ? 'ok' : 'error'} dataset`}>
            <Link isExternal href={contentStudioBaseUrl + dataQuery.id}>{dataQuery.displayName}</Link>
          </span>
        ),
        lastUpdated: (
          <span>
            {dataQuery.dataset.modifiedReadable ? dataQuery.dataset.modifiedReadable : ''}
            <br/>
            {dataQuery.dataset.modified ? dataQuery.dataset.modified : ''}
          </span>
        ),
        lastActivity: dataQuery.logData ? renderLogData(dataQuery) : <span></span>,
        refreshDataQuery: (
          <Button variant="primary"
            size="sm"
            className="mx-1"
            onClick={() => requestDatasetUpdate(dispatch, io, [dataQuery.id])}
          >
            {dataQuery.loading ? <span className="spinner-border spinner-border-sm"/> : <RefreshCw size={16}/>}
          </Button>
        )
      }
    })
  }
  const data = React.useMemo(() => getDataQueries(dataQueries), [])

  return (
    <Accordion header={`${props.header} (${dataQueries.length})`} className="mx-0" openByDefault={!!props.openByDefault}>
      <Button className="mb-3" onClick={() => updateAll()}>
        Oppdater liste
        {anyLoading ? <span className="spinner-border spinner-border-sm ml-2 mb-1" /> : <RefreshCw className="ml-2" />}
      </Button>
      <ReactTable columns={columns} data={data} />
    </Accordion>
  )
}

DataQueryTable.propTypes = {
  dataQueryType: PropTypes.string,
  header: PropTypes.string,
  openByDefault: PropTypes.bool
}

export default (props) => <DataQueryTable {...props} />
