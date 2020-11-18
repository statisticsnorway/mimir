import React, { useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Col, Row, Table, Modal } from 'react-bootstrap'
import { selectStatisticsWithRelease, selectLoading } from './selectors'
import { RefreshCw } from 'react-feather'
import Moment from 'react-moment'
import { Link } from '@statisticsnorway/ssb-component-library'
import { selectContentStudioBaseUrl } from '../HomePage/selectors'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { refreshStatistic } from './actions.es6'
import { RefreshStatisticsForm } from '../../components/RefreshStatisticsForm'

export function Statistics() {
  const statistics = useSelector(selectStatisticsWithRelease)
  const loading = useSelector(selectLoading)
  const contentStudioBaseUrl = useSelector(selectContentStudioBaseUrl)
  const [show, setShow] = useState(false)
  const [modalInfo, setModalInfo] = useState({})
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()
  const statisticsNo = statistics ? statistics.filter((s) => s.language === 'nb') : []
  const statisticsEn = statistics ? statistics.filter((s) => s.language === 'en') : []

  const statisticsFinal = []
  if (statisticsNo.length > 0) {
    statisticsNo.map((statistic) => {
      statisticsFinal.push(statistic)
      const statisticEnglish = statisticsEn.find((s) => s.shortName === statistic.shortName)
      if (statisticEnglish) {
        statisticsFinal.push(statisticEnglish)
      } else {
        statisticsFinal.push({
          shortName: statistic.shortName,
          language: 'en'
        })
      }
    })
  }

  const updateTables = (formData) => {
    const {
      owners,
      fetchPublished
    } = formData
    refreshStatistic(dispatch, io, modalInfo.id, owners, fetchPublished)
    handleClose()
  }

  function renderStatistics() {
    if (loading) {
      return (
        <span className="spinner-border spinner-border" />
      )
    }
    return (
      <div className="next-release">
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
    setShow(handleShow)
  }

  function renderStatisticsForm(key, sources, i) {
    return (
      <React.Fragment key={i}>
        <RefreshStatisticsForm onSubmit={(e) => updateTables(e)} modalInfo={modalInfo}/>
      </React.Fragment>
    )
  }

  const ModalContent = () => {
    return (
      <Modal show={show} onHide={handleClose}>
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
          <Button variant="secondary" onClick={handleClose}>
              Lukk
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  function getStatistics() {
    if (statisticsFinal.length > 0) {
      return (
        <tbody>
          {statisticsFinal.map((statistic) => {
            return (
              statisticRow(statistic)
            )
          })}
        </tbody>
      )
    }
    return (
      <tbody/>
    )
  }

  function statisticRow(statistic) {
    const key = statistic.shortName + '_' + statistic.language
    return (
      <tr key={key}>
        <td className='statistic'>
          {getShortNameLink(statistic)}
        </td>
        <td>
          {getNextRelease(statistic)}
        </td>
        <td className="text-center">{statistic.nextRelease ? makeRefreshButton(statistic) : ''}</td>
        <td/>
      </tr>
    )
  }

  function getNextRelease(statistic) {
    if (statistic.nextRelease) {
      return (
        <span>
          <Moment format="DD.MM.YYYY hh:mm">{statistic.nextRelease}</Moment>
        </span>
      )
    }
    return (
      <span/>
    )
  }

  function getShortNameLink(statistic) {
    if (statistic.nextRelease) {
      return (
        <Link
          isExternal
          href={contentStudioBaseUrl + statistic.id}>{statistic.language === 'en' ? 'Eng. ' + statistic.shortName : statistic.shortName}
        </Link>
      )
    }
    return (
      <span>{statistic.language === 'en' ? 'Eng. ' + statistic.shortName : statistic.shortName}</span>
    )
  }

  return (
    <div className="p-4 tables-wrapper">
      <h2 className="mb-3">Kommende publiseringer</h2>
      {renderStatistics()}
    </div>
  )
}

export default (props) => <Statistics {...props} />
