import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Table } from 'react-bootstrap'
import { selectStatisticsWithRelease,
  selectLoading,
  selectOpenModal } from './selectors'
import { RefreshCw } from 'react-feather'
import Moment from 'react-moment'
import { Link } from '@statisticsnorway/ssb-component-library'
import { selectContentStudioBaseUrl, selectInternalBaseUrl } from '../HomePage/selectors'
import { setOpenStatistic, setOpenModal } from './actions'
import { StatisticsLog } from './StatisticsLog'
import { RefreshStatisticsModal } from '../../components/RefreshStatisticsModal'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'

export function Statistics() {
  const statistics = useSelector(selectStatisticsWithRelease)
  const loading = useSelector(selectLoading)
  const contentStudioBaseUrl = useSelector(selectContentStudioBaseUrl)
  const internalBaseUrl = useSelector(selectInternalBaseUrl)
  const openModal = useSelector(selectOpenModal)

  const dispatch = useDispatch()
  const io = useContext(WebSocketContext)
  const statisticsNo = statistics ? statistics.filter((s) => s.language === 'nb' || s.language === 'nn') : []
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
                <span>Frekvens</span>
              </th>
              <th className="roboto-bold">
                <span>Om statistikken</span>
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
        {openModal ? <RefreshStatisticsModal/> : null }
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
    setOpenStatistic(dispatch, io, statistic)
    setOpenModal(dispatch, true)
  }

  function getStatistics() {
    if (statisticsFinal.length > 0) {
      return (
        <tbody>
          {statisticsFinal.map((statistic, index) => {
            return (
              statisticRow(statistic, index)
            )
          })}
        </tbody>
      )
    }
    return (
      <tbody/>
    )
  }

  function statisticRow(statistic, index) {
    const key = statistic.shortName + '_' + statistic.language + '_' + index
    return (
      <tr key={key}>
        <td className='statistic'>
          {getShortNameLink(statistic)}
        </td>
        <td>
          {getFrekvens(statistic)}
        </td>
        <td>
          {getAboutStatisticLink(statistic)}
        </td>
        <td>
          {getNextRelease(statistic)}
        </td>
        <td className="text-center">{statistic.nextRelease ? makeRefreshButton(statistic) : ''}</td>
        <td>
          {statistic.logData ? <StatisticsLog statistic={statistic}/> : null}
        </td>
      </tr>
    )
  }

  function getNextRelease(statistic) {
    if (statistic.nextRelease) {
      return (
        <span>
          <Moment format="DD.MM.YYYY hh:mm">{statistic.nextRelease}</Moment>
          {getStatregLinks(statistic)}
        </span>
      )
    }
    return (
      <span/>
    )
  }

  function getStatregLinks(statistic) {
    if (statistic.nextReleaseId && statistic.statisticId && statistic.variantId) {
      const editUrl = internalBaseUrl + '/statistikkregisteret/publisering/edit/' + statistic.nextReleaseId
      const createUrl = internalBaseUrl + '/statistikkregisteret/publisering/create?statistikk.id=' +
          statistic.statisticId + '&variant.id=' + statistic.variantId
      return (
        <React.Fragment>
          <Link isExternal href={editUrl} title="Endre publisering i statistikkregisteret" className="ml-2">[Endre]</Link>
          <Link isExternal href={createUrl} title="Melde ny publisering i statistikkregisteret" className="ml-2">[Meld]</Link>
        </React.Fragment>
      )
    }
    return (
      <span/>
    )
  }

  function getShortNameLink(statistic) {
    if (statistic.nextRelease) {
      return (
        <>
          <Link
            isExternal
            href={contentStudioBaseUrl + statistic.id}>
            {statistic.language === 'en' ? 'Eng. ' + statistic.shortName : statistic.shortName}
          </Link>
          <Link
            isExternal
            title="Forhåndsvisning" href={statistic.previewUrl} className="ml-2">
            [Forhåndsvisning]
          </Link>
        </>
      )
    }
    return (
      <span>{statistic.language === 'en' ? 'Eng. ' + statistic.shortName : statistic.shortName}</span>
    )
  }

  function getFrekvens(statistic) {
    if (statistic.frequency) {
      return (
        <span>{statistic.frequency}</span>
      )
    }
  }

  function getAboutStatisticLink(statistic) {
    if (statistic.aboutTheStatistics) {
      return (
        <Link
          isExternal
          href={contentStudioBaseUrl + statistic.aboutTheStatistics}>{statistic.language === 'en' ? 'Eng. ' + 'Om statistikken' : 'Om statistikken'}
        </Link>
      )
    }
    return (
      <span>{statistic.language === 'en' ? 'Eng. ' + 'Om statistikken' : 'Om statistikken'}</span>
    )
  }

  return (
    <div className="p-4 tables-wrapper border-top-0">
      <h2 className="mb-3">Kommende publiseringer</h2>
      {renderStatistics()}
    </div>
  )
}

export default (props) => <Statistics {...props} />
