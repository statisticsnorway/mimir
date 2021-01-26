import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Col, Modal, Row } from 'react-bootstrap'
import { RefreshStatisticsForm } from './RefreshStatisticsForm'
import { RefreshStatisticsStatus } from './RefreshStatisticsStatus'
import { refreshStatistic, resetRefreshStatus, setOpenModal, setOpenStatistic } from '../containers/Statistics/actions'
import { selectOpenStatistic, selectModalDisplay } from '../containers/Statistics/selectors'
import { WebSocketContext } from '../utils/websocket/WebsocketProvider'


export function RefreshStatisticsModal(props) {
  const modalDisplay = useSelector(selectModalDisplay)
  const modalInfo = useSelector(selectOpenStatistic)

  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()

  function renderStatisticsForm(key, sources, i) {
    return (
      <React.Fragment key={i}>
        {modalDisplay === 'request' && <RefreshStatisticsForm onSubmit={(e) => updateTables(e)} modalInfo={modalInfo}/>}
        {modalDisplay !== 'request' && <RefreshStatisticsStatus />}
      </React.Fragment>
    )
  }

  function handleClose() {
    setOpenModal(dispatch, false)
    setOpenStatistic(dispatch, null)
    resetRefreshStatus(dispatch, 'request')
  }

  const updateTables = (owners) => {
    refreshStatistic(dispatch, io, modalInfo.id, owners)
  }

  return (
    <Modal size='lg' show={true} onHide={() => handleClose()}>
      <Modal.Header closeButton>
        <Modal.Title>Oppdatering av tabeller på web</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col>
            <h2>Statistikk: {modalInfo.shortName}</h2>
            <span>For å oppdatere tabeller med ennå ikke publiserte tall må brukernavn og passord for lastebrukere i Statistikkbanken brukes.</span>
            <br/>
            <span>For andre endringer velg &quot;Hent publiserte tall&quot; uten å oppgi brukernavn og passord.</span>
          </Col>
        </Row>
        { renderStatisticsForm() }
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => handleClose()}>
          Lukk
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

RefreshStatisticsModal.propTypes = {}

export default (props) => <RefreshStatisticsModal {...props} />
