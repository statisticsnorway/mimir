import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { Button, Modal } from 'react-bootstrap'
import { Accordion, Link } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { requestDatasetUpdate } from './actions'
import { RefreshCw } from 'react-feather'
import { selectContentStudioBaseUrl } from '../HomePage/selectors'
import { ReactTable } from '../../components/ReactTable'
import { DataQueryBadges } from '../../components/DataQueryBadges'
import { DataQueryLog } from './DataQueryLog'
import { RefreshDataQueryButton } from './RefreshDataQueryButton'

export function DataQueryTable(props) {
  const dataQueries = useSelector(props.querySelector)
  const contentStudioBaseUrl = useSelector(selectContentStudioBaseUrl)
  const isLoading = useSelector(props.loadingSelector)
  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()
  const [modalShow, setModalShow] = React.useState(false)
  const [firstOpen, setFirstOpen] = React.useState(true)

  function updateAll() {
    const ids = dataQueries.filter((q) => !q.loading).map((q) => q.id)
    requestDatasetUpdate(dispatch, io, ids)
  }

  function closeClick() {
    setModalShow(false)
    updateAll()
  }

  function ConfirmationModal(props) {
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
              Oppdatere liste
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Er du sikker på at du vil oppdatere listen?</h4>
          <p>
              trykker du ja, vil du oppdatere alle tabeller og figurer i hele listen og
              jobben kan ikke stoppes når den er blitt startet
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalShow(false)}>Avbryt</Button>
          <Button onClick={() => closeClick()}>Ja, oppdater liste</Button>
        </Modal.Footer>
      </Modal>
    )
  }

  const anyLoading = dataQueries.filter((q) => q.loading).length > 0

  const columns = React.useMemo(() => [
    {
      Header: 'Spørring ',
      accessor: 'dataQuery',
      sortType: (a, b) => {
        return a.original.dataQuerySort > b.original.dataQuerySort ? 1 : -1
      }
    },
    {
      Header: 'Sist oppdatert ',
      accessor: 'lastUpdated',
      sortType: (a, b) => {
        return a.original.lastUpdatedSort > b.original.lastUpdatedSort ? 1 : -1
      }
    },
    {
      Header: 'Siste aktivitet ',
      accessor: 'lastActivity',
      sortType: (a, b) => {
        return a.original.lastActivitySort > b.original.lastActivitySort ? 1 : -1
      }
    },
    {
      Header: '',
      accessor: 'refreshDataQuery',
      disableSortBy: true
    }
  ], [])

  function getDataQueries() {
    return dataQueries.map((dataQuery) => {
      return {
        dataQuery: (
          <span className={`${dataQuery.hasData ? 'ok' : 'error'} dataset`}>
            <Link isExternal href={contentStudioBaseUrl + dataQuery.id}>{dataQuery.displayName}</Link>
            <DataQueryBadges contentType={dataQuery.type} format={dataQuery.format} isPublished={dataQuery.isPublished}/>
          </span>
        ),
        dataQuerySort: dataQuery.displayName.toLowerCase(),
        lastUpdated: (
          <span>
            {dataQuery.dataset.modifiedReadable ? dataQuery.dataset.modifiedReadable : ''}
            <br/>
            {dataQuery.dataset.modified ? dataQuery.dataset.modified : ''}
          </span>
        ),
        lastUpdatedSort: dataQuery.dataset && dataQuery.dataset.modified ? new Date(dataQuery.dataset.modified) : new Date('01.01.1970'),
        lastActivity: (
          <DataQueryLog dataQueryId={dataQuery.id} />
        ),
        lastActivitySort: dataQuery.logData && dataQuery.logData.modified ? new Date(dataQuery.logData.modified) : new Date('01.01.1970'),
        refreshDataQuery: (
          <RefreshDataQueryButton dataQueryId={dataQuery.id} />
        )
      }
    })
  }

  function onToggleAccordion(isOpen) {
    if (firstOpen && isOpen) {
      setFirstOpen(false)
      props.requestQueries(dispatch, io)
    }
  }


  function renderAccordionBody() {
    if (isLoading) {
      return (
        <span className="spinner-border spinner-border" />
      )
    }
    return (
      <React.Fragment>
        <ReactTable columns={columns} data={data} />
        <Button className="mb-3 float-right" onClick={() => setModalShow(true)}>
          Oppdater liste
          {anyLoading ? <span className="spinner-border spinner-border-sm ml-2 mb-1" /> : <RefreshCw className="ml-2" />}
        </Button>
        <ConfirmationModal
          show={modalShow}
          onHide={() => setModalShow(false)}
        />
      </React.Fragment>
    )
  }

  onToggleAccordion(props.openByDefault)
  const data = React.useMemo(() => getDataQueries(), [dataQueries])
  return (
    <Accordion
      header={`${props.header} (${dataQueries.length})`}
      className="mx-0"
      openByDefault={!!props.openByDefault}
      onToggle={(isOpen) => onToggleAccordion(isOpen)}
    >
      {renderAccordionBody()}
    </Accordion>
  )
}

DataQueryTable.defaultProps = {
  openByDefault: false
}

DataQueryTable.propTypes = {
  header: PropTypes.string,
  openByDefault: PropTypes.bool,
  querySelector: PropTypes.func.isRequired,
  loadingSelector: PropTypes.func.isRequired,
  requestQueries: PropTypes.func.isRequired
}

export default (props) => <DataQueryTable {...props} />
