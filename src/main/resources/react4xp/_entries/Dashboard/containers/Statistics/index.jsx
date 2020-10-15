import React, { useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Col, Row, Table, Modal } from 'react-bootstrap'
import { selectStatistics, selectLoading } from './selectors'
import { RefreshCw } from 'react-feather'
import Moment from 'react-moment'
import { Link } from '@statisticsnorway/ssb-component-library'
import { selectContentStudioBaseUrl } from '../HomePage/selectors'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { refreshStatistic } from './actions.es6'
import { RefreshStatisticsForm } from '../../components/RefreshStatisticsForm'

export function Statistics() {
  const statistics = useSelector(selectStatistics)
  const loading = useSelector(selectLoading)
  const contentStudioBaseUrl = useSelector(selectContentStudioBaseUrl)
  const [show, setShow] = useState(false)
  const [modalInfo, setModalInfo] = useState({})
  const [showModal, setShowModal] = useState(false)
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()

  const toggleTrueFalse = () => {
    setShowModal(handleShow)
  }

  const updateTables = (formData) => {
    const {
      // username,
      // password,
      fetchPublished
    } = formData
    refreshStatistic(dispatch, io, modalInfo.id, fetchPublished)
    handleClose()
  }

  function renderStatistics() {
    if (loading) {
      return (
        <span className="spinner-border spinner-border" />
      )
    }
    return (
      <div>
        <Table bordered striped>
          <thead>
            <tr>
              <th className="roboto-bold">
                <span>Statistikk</span>
              </th>
              <th className="roboto-bold">
                <span>Neste publisering</span>
              </th>
              <th />
              <th className="roboto-bold">
                <span>Logg/sist oppdatert</span>
              </th>
            </tr>
          </thead>
          {getStatistics()}
        </Table>
        {show ? <ModalContent/> : null }
      </div>
    )
  }

  function makeRefreshButton(statistic) {
    return (
      <Button
        variant="primary"
        size="sm"
        className="mx-1"
        onClick={() => onRefreshStatistic(statistic)}
        disabled={statistic.loading}
      >
        { statistic.loading ? <span className="spinner-border spinner-border-sm" /> : <RefreshCw size={16}/> }
      </Button>
    )
  }

  function onRefreshStatistic(statistic) {
    setModalInfo(statistic)
    toggleTrueFalse()
  }

  const ModalContent = () => {
    return (
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Oppdatering av tabeller på web</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h2>Statistikk: {modalInfo.shortName}</h2>
          <span>For å oppdatere tabeller med ennå ikke publiserte tall må brukernavn og passord for lastebrukere i Statistikkbanken brukes.</span>
          <br/>
          <span>For andre endringer velg "Hent publiserte tall" uten å oppgi brukernavn og passord</span>
          <RefreshStatisticsForm onSubmit={(e) => updateTables(e)}/>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
              Lukk
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  function getStatistics() {
    if (statistics != undefined) {
      return (
        <tbody>
          {statistics.map((statistic) => {
            return (
              <tr key={statistic.id}>
                <td className='statistic'>
                  <Link
                    isExternal
                    href={contentStudioBaseUrl + statistic.id}>{statistic.language === 'en' ? 'Eng. ' + statistic.shortName : statistic.shortName}
                  </Link>
                </td>
                <td>
                  <span>
                    <Moment format="DD.MM.YYYY hh:mm">{statistic.nextRelease}</Moment>
                  </span>
                </td>
                <td className="text-center">{makeRefreshButton(statistic)}</td>
                <td/>
              </tr>
            )
          })}
        </tbody>
      )
    }
    return (
      <tbody/>
    )
  }

  return (
    <section className="xp-part part-dashboard container mb-5">
      <Row>
        <Col>
          <div className="p-4 tables-wrapper">
            <h2 className="mb-3">Kommende publiseringer</h2>
            {renderStatistics()}
          </div>
        </Col>
      </Row>
    </section>
  )
}

export default (props) => <Statistics {...props} />
