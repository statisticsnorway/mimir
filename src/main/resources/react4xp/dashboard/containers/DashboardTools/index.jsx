import React, { useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectInternalBaseUrl, selectInternalStatbankUrl, selectLoadingClearCache } from '../HomePage/selectors'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { requestClearCache } from '../HomePage/actions'
import { RefreshCw, Rss, Trash } from 'react-feather'
import { Col, Container, Row, Alert } from 'react-bootstrap'
import { Button, Dropdown, Input } from '@statisticsnorway/ssb-component-library'
import { selectSearchList, selectLoadingSearchList, selectHasLoadingStatistic } from '../Statistics/selectors'
import { setOpenStatistic, setOpenModal } from '../Statistics/actions'
import { startRefresh } from '../StatRegDashboard/actions'
import { selectStatuses } from '../StatRegDashboard/selectors'
import { selectStatistics } from '../Statistics/selectors'
import { RefreshStatRegModal } from './RefreshStatRegModal'
import axios from 'axios'

export function DashboardTools() {
  const loadingCache = useSelector(selectLoadingClearCache)
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
      <div className="d-flex justify-content-center align-items-center">
        <span className="fw-bold">Oppdater alle {statRegName}</span>
        <Button
          className="ml-auto"
          onClick={() => refreshStatReg(statRegStatus.key)}
          disabled={statRegStatus.loading}
        >
          { statRegStatus.loading ? <span className="spinner-border spinner-border-sm" /> : <RefreshCw size={18}/> }
        </Button>
      </div>
    )
  }

  function clearCache() {
    requestClearCache(dispatch, io)
  }

  function pushRss() {
    setPushingRss(true)
    axios.get(
      '/xp/admin/_/service/mimir/rssPush'
    ).then((response) => {
      setRssStatus('success')
      setPushRssResult(response.data)
    }
    ).catch((error) => {
      setRssStatus('danger')
      setPushRssResult(error.message)
    }
    )
      .finally(() => {
        setPushingRss(false)
      }
      )
  }

  function renderIcon(loading) {
    if (loading) {
      return (<span className="spinner-border spinner-border-sm" />)
    }
    return (<Trash size={20}/>)
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
      return (
        <span className="spinner-border spinner-border-sm ml-2 mb-1" />
      )
    }
    const items = statisticsSearchList.map((s) => {
      return {
        title: `${s.shortName} - ${s.name}`,
        id: s.id
      }
    })
    if (items.length === 0) {
      items.push({
        title: `Ingen statistikker`,
        id: '-1'
      })
    }

    return (
      <Dropdown
        className="dropdown-update-statistics"
        header="Søk og oppdater statistikk"
        placeholder="Søk og oppdater statistikk"
        searchable
        items={items}
        onSelect={(e) => onStatisticsSearchSelect(e)}
      />
    )
  }

  function getLinkOptions() {
    const linkOptions = []
    linkOptions.push({
      id: 'link-statreg',
      title: 'Statistikkregisteret'
    },
    {
      id: 'link-designer',
      title: 'Tabellbygger'
    },
    {
      id: 'link-statbank',
      title: 'Intern statistikkbank'
    },
    {
      id: 'link-guide-publications',
      title: 'Veiledninger i publiseringer på ssb.no'
    })
    return linkOptions
  }

  function openLinkInNewWindow(link) {
    window.open(link, '_blank')
  }

  function renderLinkTools() {
    const openLinks = (item) => {
      if (item.id === 'link-statreg') {
        return openLinkInNewWindow(`${internalBaseUrl}/statistikkregisteret/publisering/list`)
      } else if (item.id === 'link-designer') {
        return openLinkInNewWindow(`${internalBaseUrl}/designer`)
      } else if (item.id === 'link-statbank') {
        return openLinkInNewWindow(internalStatbankUrl)
      } else if (item.id === 'link-guide-publications') {
        return openLinkInNewWindow('https://wiki.ssb.no/display/VEILEDNING/Home')
      }
      return
    }

    return (
      <Dropdown
        className="other-tools-dropdown"
        header="Andre verktøy"
        selectedItem={{
          id: 'link-dropdown-placeholder',
          title: 'Andre verktøy'
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
          className="mt-3"
          ariaLabel="Search table ID"
          placeholder="Finn TBML-def. med tabellnummer"
          searchField
          submitCallback={handleTbmlDefinitionsStatbankTableSearch}
        />
      </Col>
    )
  }

  return (
    <div className="p-4 tables-wrapper">
      <h2 className="mb-4">Verktøy</h2>
      <Container>
        <Row className="mb-4">
          <Col className="col-9 pr-0">
            {renderStatisticsSearch()}
          </Col>
          <Col className="pl-4 pr-0">
            <Button
              onClick={() => {
                setOpenStatistic(dispatch, io, selectedStat)
                setOpenModal(dispatch, true)
              }}
              disabled={hasLoadingStatistic || loadingStatisticsSearchList || !selectedStat}
            >
              { hasLoadingStatistic ? <span className="spinner-border spinner-border-sm" /> : <RefreshCw size={18}/> }
            </Button>
          </Col>
        </Row>
        {statuses.map((statRegStatus, index) => {
          const {} = statRegStatus
          return (
            <Row className="mb-4" key={index}>
              <Col>
                {makeStatRegRefreshOptions(statRegStatus)}
              </Col>
            </Row>
          )
        })}
        {modalShow && <RefreshStatRegModal statRegKey={selectedStatRegKey} handleClose={() => setModalShow(false)} />}
        <Row className="mb-5">
          {renderTbmlDefinitionsStatbankTable()}
        </Row>
        <fieldset className="danger-zone mb-3 p-2">
          <legend align="center" className="danger-title justify-content-center">Danger Zone</legend>
          <Row className="mb-1">
            <Col>
              <Button
                primary
                className="w-100 d-flex justify-content-center"
                onClick={() => clearCache()}
                disabled={loadingCache}>
                <div>
                  {renderIcon(loadingCache)} <span>Tøm cache</span>
                </div>
              </Button>
            </Col>
          </Row>
          <Row className="mb-1">
            <Col>
              <Button
                primary
                className="w-100 d-flex justify-content-center"
                onClick={() => pushRss()}
                disabled={pushingRss}>
                <div>
                  <Rss /> <span>Push RSS</span>
                </div>
              </Button>
            </Col>
          </Row>
          <Row>
            <Col>
              <Alert variant={rssStatus} show={!!pushRssResult}>{pushRssResult}</Alert>
            </Col>
          </Row>
        </fieldset>
        <Row className="mb-4">
          <Col>
            {renderLinkTools()}
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default (props) => <DashboardTools {...props} />
