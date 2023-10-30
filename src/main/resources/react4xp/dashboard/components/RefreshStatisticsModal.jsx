import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Col, Modal, Row } from 'react-bootstrap'
import { Button } from '@statisticsnorway/ssb-component-library'
import { RefreshStatisticsForm } from '/react4xp/dashboard/components/RefreshStatisticsForm'
import { RefreshStatisticsStatus } from '/react4xp/dashboard/components/RefreshStatisticsStatus'
import {
  refreshStatistic,
  setOpenModal,
  setOpenStatistic,
  setModal,
  resetModal,
} from '/react4xp/dashboard/containers/Statistics/actions'
import { createSelectModalDisplay, selectOpenStatistic } from '/react4xp/dashboard/containers/Statistics/selectors'
import { WebSocketContext } from '/react4xp/dashboard/utils/websocket/WebsocketProvider'

export function RefreshStatisticsModal(props) {
  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()

  const openStatistic = useSelector(selectOpenStatistic)
  const selectModalDisplay = createSelectModalDisplay(openStatistic.id)
  const modal = useSelector(selectModalDisplay)

  function renderStatisticsForm() {
    if (!modal) {
      const newModal = {
        statisticId: openStatistic.id,
        modalDisplay: 'request',
        updateMessages: [],
      }
      setModal(dispatch, newModal)
    }

    if (openStatistic.loadingOwnersWithSources || !openStatistic.ownersWithSources) {
      return <span className='spinner-border spinner-border' />
    }
    return (
      <React.Fragment>
        {modal.modalDisplay === 'request' && (
          <RefreshStatisticsForm onSubmit={(e) => updateTables(e)} modalInfo={openStatistic} />
        )}
        {modal.modalDisplay !== 'request' && <RefreshStatisticsStatus modal={modal} />}
      </React.Fragment>
    )
  }

  function handleClose() {
    setOpenModal(dispatch, false)
    setOpenStatistic(dispatch, io, null)
    resetModal(dispatch, openStatistic.id)
  }

  const updateTables = (owners) => {
    refreshStatistic(dispatch, io, openStatistic.id, owners)
  }

  const modalLoading = modal && modal.modalDisplay === 'loading'
  return (
    <Modal
      size='lg'
      show={true}
      onHide={() => handleClose()}
      keyboard={!modalLoading}
      backdrop={modalLoading ? 'static' : undefined}
    >
      <Modal.Header closeButton={!modalLoading}>
        <Modal.Title>Oppdatering av tabeller på web</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col>
            <h2>Statistikk: {openStatistic.shortName}</h2>
            <span>
              For å oppdatere tabeller med ennå ikke publiserte tall må brukernavn og passord for lastebrukere i
              Statistikkbanken brukes.
            </span>
            <br />
            <span>
              For andre endringer velg &quot;Hent oppdatert tabellstruktur fra Tabellbygger med publiserte tall&quot;
              uten å oppgi brukernavn og passord.
            </span>
          </Col>
        </Row>
        {renderStatisticsForm()}
      </Modal.Body>
      <Modal.Footer>
        <Button disabled={modalLoading} onClick={() => handleClose()}>
          Lukk
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

RefreshStatisticsModal.propTypes = {}

export default (props) => <RefreshStatisticsModal {...props} />
