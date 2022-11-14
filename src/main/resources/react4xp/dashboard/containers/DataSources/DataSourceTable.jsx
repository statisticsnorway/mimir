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
import { DataSourceLog } from './DataSourceLog'
import { RefreshDataSourceButton } from './RefreshDataSourceButton'

export function DataSourceTable(props) {
  const dataSources = useSelector(props.dataSourceSelector)
  const contentStudioBaseUrl = useSelector(selectContentStudioBaseUrl)
  const isLoading = useSelector(props.loadingSelector)
  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()
  const [modalShow, setModalShow] = React.useState(false)
  const [firstOpen, setFirstOpen] = React.useState(true)

  function updateAll() {
    const ids = dataSources.filter((q) => !q.loading).map((q) => q.id)
    requestDatasetUpdate(dispatch, io, ids)
  }

  function closeClick() {
    setModalShow(false)
    updateAll()
  }

  function ConfirmationModal(props) {
    return (
      <Modal {...props} size='lg' aria-labelledby='contained-modal-title-vcenter' centered>
        <Modal.Header closeButton>
          <Modal.Title id='contained-modal-title-vcenter'>Oppdatere liste</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Er du sikker på at du vil oppdatere listen?</h4>
          <p>
            trykker du ja, vil du oppdatere alle tabeller og figurer i hele listen og jobben kan ikke stoppes når den er
            blitt startet
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setModalShow(false)}>
            Avbryt
          </Button>
          <Button onClick={() => closeClick()}>Ja, oppdater liste</Button>
        </Modal.Footer>
      </Modal>
    )
  }

  const anyLoading = dataSources.filter((ds) => ds.loading).length > 0

  const columns = React.useMemo(
    () => [
      {
        Header: 'Spørring ',
        accessor: 'dataSource',
        sortType: (a, b) => {
          return a.original.dataSourceSort > b.original.dataSourceSort ? 1 : -1
        },
      },
      {
        Header: 'Sist oppdatert ',
        accessor: 'lastUpdated',
        sortType: (a, b) => {
          return a.original.lastUpdatedSort > b.original.lastUpdatedSort ? 1 : -1
        },
      },
      {
        Header: 'Siste aktivitet ',
        accessor: 'lastActivity',
        sortType: (a, b) => {
          return a.original.lastActivitySort > b.original.lastActivitySort ? 1 : -1
        },
      },
      {
        Header: '',
        accessor: 'refreshDataSource',
        disableSortBy: true,
      },
    ],
    []
  )

  function getDataSources() {
    return dataSources.map((dataSource) => {
      return {
        dataSource: (
          <span className={`${dataSource.hasData ? 'ok' : 'error'} dataset`}>
            <Link isExternal href={contentStudioBaseUrl + dataSource.id}>
              {dataSource.displayName}
            </Link>
            <DataQueryBadges
              contentType={dataSource.type}
              format={dataSource.format}
              isPublished={dataSource.isPublished}
            />
          </span>
        ),
        dataSourceSort: dataSource.displayName.toLowerCase(),
        lastUpdated: (
          <span>
            {dataSource.dataset.modifiedReadable ? dataSource.dataset.modifiedReadable : ''}
            <br />
            {dataSource.dataset.modified ? dataSource.dataset.modified : ''}
          </span>
        ),
        lastUpdatedSort:
          dataSource.dataset && dataSource.dataset.modified
            ? new Date(dataSource.dataset.modified)
            : new Date('01.01.1970'),
        lastActivity: <DataSourceLog dataSourceId={dataSource.id} />,
        lastActivitySort:
          dataSource.logData && dataSource.logData.modified
            ? new Date(dataSource.logData.modified)
            : new Date('01.01.1970'),
        refreshDataSource: <RefreshDataSourceButton dataSourceId={dataSource.id} />,
      }
    })
  }

  function onToggleAccordion(isOpen) {
    if (firstOpen && isOpen) {
      setFirstOpen(false)
      props.requestDataSources(dispatch, io)
    }
  }

  function renderAccordionBody() {
    if (isLoading) {
      return <span className='spinner-border spinner-border' />
    }
    return (
      <React.Fragment>
        <ReactTable columns={columns} data={data} />
        <Button className='mb-3 float-end' onClick={() => setModalShow(true)}>
          Oppdater liste
          {anyLoading ? (
            <span className='spinner-border spinner-border-sm ms-2 mb-1' />
          ) : (
            <RefreshCw className='ms-2' />
          )}
        </Button>
        <ConfirmationModal show={modalShow} onHide={() => setModalShow(false)} />
      </React.Fragment>
    )
  }

  onToggleAccordion(props.openByDefault)
  const data = React.useMemo(() => getDataSources(), [dataSources])
  return (
    <props.type
      header={`${props.header} (${isLoading || firstOpen ? '-' : dataSources.length})`}
      className='mx-0'
      openByDefault={!!props.openByDefault}
      onToggle={(isOpen) => onToggleAccordion(isOpen)}
    >
      {renderAccordionBody()}
    </props.type>
  )
}

DataSourceTable.defaultProps = {
  openByDefault: false,
  type: Accordion,
}

DataSourceTable.propTypes = {
  header: PropTypes.string,
  openByDefault: PropTypes.bool,
  dataSourceSelector: PropTypes.func.isRequired,
  loadingSelector: PropTypes.func.isRequired,
  requestDataSources: PropTypes.func.isRequired,
  type: PropTypes.elementType,
}

export default (props) => <DataSourceTable {...props} />
