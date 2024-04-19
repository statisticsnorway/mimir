import React, { useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectInternalBaseUrl,
  selectInternalStatbankUrl,
  selectLoadingClearCache,
  selectLoadingPurgeVarnish,
  selectVarnishPurgeResult,
  selectLoadingRefreshNameGraph,
  selectRefreshNameGraphResult,
  selectStatregRapportUrl,
} from '/react4xp/dashboard/containers/HomePage/selectors'
import { WebSocketContext } from '/react4xp/dashboard/utils/websocket/WebsocketProvider'
import {
  requestClearCache,
  requestPurgeVarnishCache,
  requestRefreshNameGraph,
} from '/react4xp/dashboard/containers/HomePage/actions'
import { RefreshCw, Rss, Trash } from 'react-feather'
import { Col, Container, Row, Alert } from 'react-bootstrap'
import { Button, Dropdown, Input } from '@statisticsnorway/ssb-component-library'
import {
  selectSearchList,
  selectLoadingSearchList,
  selectHasLoadingStatistic,
  selectStatistics,
} from '/react4xp/dashboard/containers/Statistics/selectors'
import { setOpenStatistic, setOpenModal } from '/react4xp/dashboard/containers/Statistics/actions'
import { startRefresh } from '/react4xp/dashboard/containers/StatRegDashboard/actions'
import { selectStatuses } from '/react4xp/dashboard/containers/StatRegDashboard/selectors'
import { RefreshStatRegModal } from '/react4xp/dashboard/containers/DashboardTools/RefreshStatRegModal'
import axios from 'axios'

export function DashboardTools() {
  const loadingCache = useSelector(selectLoadingClearCache)
  const loadingVarnishPurge = useSelector(selectLoadingPurgeVarnish)
  const varnishPurgeResult = useSelector(selectVarnishPurgeResult)
  const loadingRefreshNameGraph = useSelector(selectLoadingRefreshNameGraph)
  const refreshNameGraphResult = useSelector(selectRefreshNameGraphResult)
  const [pushingRss, setPushingRss] = useState(false)
  const [pushRssResult, setPushRssResult] = useState('')
  const [rssStatus, setRssStatus] = useState('success')
  const statisticsSearchList = useSelector(selectSearchList)
  const statistics = useSelector(selectStatistics)
  const loadingStatisticsSearchList = useSelector(selectLoadingSearchList)
  const hasLoadingStatistic = useSelector(selectHasLoadingStatistic)
  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()
  const [selectedStat, setSelectedStat] = useState(null)
  const statuses = useSelector(selectStatuses)
  const internalBaseUrl = useSelector(selectInternalBaseUrl)
  const internalStatbankUrl = useSelector(selectInternalStatbankUrl)
  const statregRapportUrl = useSelector(selectStatregRapportUrl)

  const [selectedStatRegKey, setSelectStatRegKey] = useState(null)
  const [modalShow, setModalShow] = useState(false)

  function refreshStatReg(key) {
    startRefresh(dispatch, io, [key])
    setSelectStatRegKey(key)
    setModalShow(true)
  }

  function makeStatRegRefreshOptions(statRegStatus) {
    let statRegName
    if (statRegStatus.displayName === 'statistikk') {
      statRegName = 'statistikker'
    } else {
      statRegName = statRegStatus.displayName
    }

    return (
      <div className='d-flex justify-content-between align-items-center'>
        <span className='fw-bold'>Oppdater alle {statRegName}</span>
        <Button className='ms-auto' onClick={() => refreshStatReg(statRegStatus.key)} disabled={statRegStatus.loading}>
          {statRegStatus.loading ? <span className='spinner-border spinner-border-sm' /> : <RefreshCw size={18} />}
        </Button>
      </div>
    )
  }

  function clearCache() {
    requestClearCache(dispatch, io)
  }

  function purgeVarnishCache() {
    requestPurgeVarnishCache(dispatch, io)
  }

  function refreshNameGraph() {
    requestRefreshNameGraph(dispatch, io)
  }

  function pushRss() {
    setPushingRss(true)
    axios
      .get('/xp/admin/_/service/mimir/rssPush')
      .then((response) => {
        setRssStatus('success')
        setPushRssResult(response.data)
      })
      .catch((error) => {
        setRssStatus('danger')
        setPushRssResult(error.message)
      })
      .finally(() => {
        setPushingRss(false)
      })
  }

  function renderIcon(loading: boolean) {
    if (loading) {
      return <span className='spinner-border spinner-border-sm' />
    }
    return <Trash size={20} />
  }

  function onStatisticsSearchSelect(e) {
    let stat = statistics.find((s) => s.id === e.id)
    if (!stat) {
      stat = statisticsSearchList.find((s) => s.id === e.id)
    }
    setSelectedStat(stat)
  }

  function renderStatisticsSearch() {
    if (loadingStatisticsSearchList) {
      return <span className='spinner-border spinner-border-sm ms-2 mb-1' />
    }
    const items = statisticsSearchList.map((s) => {
      return {
        title: `${s.shortName} - ${s.name}`,
        id: s.id,
      }
    })
    if (items.length === 0) {
      items.push({
        title: `Ingen statistikker`,
        id: '-1',
      })
    }

    return (
      <Dropdown
        className='w-100 dropdown-update-statistics'
        header='Søk og oppdater statistikk'
        placeholder='Søk og oppdater statistikk'
        searchable
        items={items}
        onSelect={(e) => onStatisticsSearchSelect(e)}
      />
    )
  }

  function getLinkOptions() {
    const linkOptions = []
    linkOptions.push(
      {
        id: 'link-statreg',
        title: 'Statistikkregisteret',
      },
      {
        id: 'link-statbank',
        title: 'Intern statistikkbank',
      },
      {
        id: 'link-guide-publications',
        title: 'Veiledninger i publisering',
      },
      {
        id: 'link-status-statreg',
        title: 'Statusrapporter StatReg',
      },
      {
        id: 'link-tbml-validation',
        title: 'TBML validering',
      }
    )
    return linkOptions
  }

  function openLinkInNewWindow(link) {
    window.open(link, '_blank')
  }

  function renderLinkTools() {
    const openLinks = (item) => {
      if (item.id === 'link-statreg') {
        openLinkInNewWindow(`${internalBaseUrl}/statistikkregisteret/publisering/list`)
      } else if (item.id === 'link-statbank') {
        openLinkInNewWindow(internalStatbankUrl)
      } else if (item.id === 'link-guide-publications') {
        openLinkInNewWindow('https://wiki.ssb.no/display/VEILEDNING/Brukerdokumentasjon+for+publisering+i+XP')
      } else if (item.id === 'link-status-statreg') {
        openLinkInNewWindow(`${statregRapportUrl}`)
      } else if (item.id === 'link-tbml-validation') {
        openLinkInNewWindow(`${internalBaseUrl}/tbprocessor/document/validateTbml/216725`)
      }
    }

    return (
      <Dropdown
        className='other-tools-dropdown'
        header='Andre verktøy'
        selectedItem={{
          id: 'link-dropdown-placeholder',
          title: 'Andre verktøy',
        }}
        items={getLinkOptions()}
        onSelect={openLinks}
      />
    )
  }

  function handleTbmlDefinitionsStatbankTableSearch(value) {
    window.open(`${internalBaseUrl}/tbprocessor/document/listByTableId?tableid=${value}`, '_blank')
  }

  function renderTbmlDefinitionsStatbankTable() {
    return (
      <Col>
        <Input
          className='mt-3'
          ariaLabel='Search table ID'
          placeholder='Finn TBML-def. med tabellnummer'
          searchField
          submitCallback={handleTbmlDefinitionsStatbankTableSearch}
        />
      </Col>
    )
  }

  return (
    <div className='p-4 tables-wrapper'>
      <h2 className='mb-4'>Verktøy</h2>
      <Container>
        <Row className='mb-4'>
          <Col className='d-inline-flex align-content-center justify-content-between'>
            {renderStatisticsSearch()}
            <Button
              className='m-0'
              onClick={() => {
                setOpenStatistic(dispatch, io, selectedStat)
                setOpenModal(dispatch, true)
              }}
              disabled={hasLoadingStatistic || loadingStatisticsSearchList || !selectedStat}
            >
              {hasLoadingStatistic ? <span className='spinner-border spinner-border-sm' /> : <RefreshCw size={18} />}
            </Button>
          </Col>
        </Row>
        {statuses.map((statRegStatus, index) => {
          return (
            <Row className='mb-4' key={index}>
              <Col>{makeStatRegRefreshOptions(statRegStatus)}</Col>
            </Row>
          )
        })}
        {modalShow && <RefreshStatRegModal statRegKey={selectedStatRegKey} handleClose={() => setModalShow(false)} />}
        <Row className='mb-5'>{renderTbmlDefinitionsStatbankTable()}</Row>
        <fieldset className='safe-zone d-flex flex-column justify-content-center mb-3 p-2'>
          <h3 className='mb-4'>Manuelle jobber</h3>
          <Row className='mb-1'>
            <Col>
              <Button
                primary
                className='w-100 d-flex justify-content-center'
                onClick={() => purgeVarnishCache()}
                disabled={loadingVarnishPurge}
              >
                <div>
                  {renderIcon(loadingVarnishPurge)} <span>Tøm Varnish</span>
                </div>
              </Button>
            </Col>
          </Row>
          <Row>
            <Col>
              <Alert variant={'info'} show={!!varnishPurgeResult}>
                <h5 className='alert-heading'>Varnish Purge</h5>
                {varnishPurgeResult}
              </Alert>
            </Col>
          </Row>
          <Row className='mb-1'>
            <Col>
              <Button
                primary
                className='w-100 d-flex justify-content-center'
                onClick={() => clearCache()}
                disabled={loadingCache}
              >
                <div>
                  {renderIcon(loadingCache)} <span>Tøm XP cache</span>
                </div>
              </Button>
            </Col>
          </Row>
          <Row className='mb-1'>
            <Col>
              <Button
                primary
                className='w-100 d-flex justify-content-center'
                onClick={() => pushRss()}
                disabled={pushingRss}
              >
                <div>
                  <Rss /> <span>Push RSS</span>
                </div>
              </Button>
            </Col>
          </Row>
          <Row>
            <Col>
              <Alert variant={rssStatus} show={!!pushRssResult}>
                {pushRssResult}
              </Alert>
            </Col>
          </Row>
          <Row className='mb-1'>
            <Col>
              <Button
                primary
                className='w-100 d-flex justify-content-center'
                onClick={() => refreshNameGraph()}
                disabled={loadingRefreshNameGraph}
              >
                <div>
                  <RefreshCw /> <span>Oppdatere data Navnegrafer</span>
                </div>
              </Button>
            </Col>
          </Row>
          <Row>
            <Col>
              <Alert variant={'info'} show={!!refreshNameGraphResult}>
                <h5 className='alert-heading'>Oppdatert navnegrafer</h5>
                {refreshNameGraphResult}
              </Alert>
            </Col>
          </Row>
        </fieldset>
        <Row className='mb-4'>
          <Col>{renderLinkTools()}</Col>
        </Row>
      </Container>
    </div>
  )
}

export default (props) => <DashboardTools {...props} />
