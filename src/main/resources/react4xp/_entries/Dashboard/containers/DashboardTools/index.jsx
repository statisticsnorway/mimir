import React, { useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectInternalBaseUrl, selectInternalStatbankUrl, selectLoadingClearCache } from '../HomePage/selectors'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { requestClearCache } from '../HomePage/actions.es6'
import { RefreshCw, Trash } from 'react-feather'
import { Col, Container, Row } from 'react-bootstrap'
import { Button, Dropdown, Input } from '@statisticsnorway/ssb-component-library'
import { selectSearchList, selectLoadingSearchList, selectHasLoadingStatistic } from '../Statistics/selectors'
import { setOpenStatistic, setOpenModal } from '../Statistics/actions'
import { startRefresh } from '../StatRegDashboard/actions'
import { selectStatuses } from '../StatRegDashboard/selectors'
import { selectStatistics } from '../Statistics/selectors.es6'

export function DashboardTools() {
  const loadingCache = useSelector(selectLoadingClearCache)
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

  function refreshStatReg(key) {
    startRefresh(dispatch, io, [key])
  }

  function makeRefreshButton(statRegStatus) {
    let statRegName
    if (statRegStatus.displayName === 'statistikk') {
      statRegName = 'statistikker'
    } else {
      statRegName = statRegStatus.displayName
    }

    return (
      <div className="d-flex align-items-center">
        <span className="font-weight-bold">Oppdater alle {statRegName}</span>
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

  function renderIcon(loading) {
    if (loading) {
      return (<span className="spinner-border spinner-border-sm" />)
    }
    return (<Trash size={18}/>)
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
        className="search-update-statistics"
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

  function renderLinkTools() {
    const openLinks = (item) => {
      if (item.id === 'link-statreg') {
        return window.open(`${internalBaseUrl}/statistikkregisteret/publisering/list`, '_blank')
      } else if (item.id === 'link-designer') {
        return window.open(`${internalBaseUrl}/designer`, '_blank')
      } else if (item.id === 'link-statbank') {
        return window.open(internalStatbankUrl, '_blank')
      } else if (item.id === 'link-guide-publications') {
        return window.open('https://wiki.ssb.no/display/VEILEDNING/Home', '_blank')
      }
      return
    }

    return (
      <Dropdown
        className="other-tools-dropdown"
        header="Andre verktøy"
        selectedItem={{
          id: 'placeholder',
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
    <div className="p-4 tables-wrapper border-top-0">
      <h2 className="mb-4">Verktøy</h2>
      <Container>
        <Row className="mb-5">
          <Col>
            <Button
              primary
              className="w-100 d-flex justify-content-center"
              onClick={() => clearCache()}
              disabled={loadingCache}>
              <div>
                {renderIcon(loadingCache)} <span className="pl-2">Tøm cache</span>
              </div>
            </Button>
          </Col>
        </Row>
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
                {makeRefreshButton(statRegStatus)}
              </Col>
            </Row>
          )
        })}
        <Row className="mb-5">
          {renderTbmlDefinitionsStatbankTable()}
        </Row>
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
