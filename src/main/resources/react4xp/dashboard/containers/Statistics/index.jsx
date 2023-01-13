import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Table } from 'react-bootstrap'
import {
  selectStatistics,
  selectLoading,
  selectOpenModal,
} from '/react4xp/dashboard/containers/Statistics/selectors'
import { RefreshCw } from 'react-feather'
import Moment from 'react-moment'
import { Link } from '@statisticsnorway/ssb-component-library'
import {
  selectContentStudioBaseUrl,
  selectInternalBaseUrl,
} from '/react4xp/dashboard/containers/HomePage/selectors'
import { setOpenStatistic, setOpenModal } from '/react4xp/dashboard/containers/Statistics/actions'
import { StatisticsLog } from '/react4xp/dashboard/containers/Statistics/StatisticsLog'
import { RefreshStatisticsModal } from '/react4xp/dashboard/components/RefreshStatisticsModal'
import { WebSocketContext } from '/react4xp/dashboard/utils/websocket/WebsocketProvider'

export function Statistics() {
  const statistics = useSelector(selectStatistics)
  const loading = useSelector(selectLoading)
  const contentStudioBaseUrl = useSelector(selectContentStudioBaseUrl)
  const internalBaseUrl = useSelector(selectInternalBaseUrl)
  const openModal = useSelector(selectOpenModal)

  const dispatch = useDispatch()
  const io = useContext(WebSocketContext)
  const activeStatistics = statistics ? statistics.filter((s) => s.status === 'A') : []
  const statisticsNo = activeStatistics.filter((s) => s.language === 'nb' || s.language === 'nn')
  const statisticsEn = activeStatistics.filter((s) => s.language === 'en')

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
          language: 'en',
        })
      }
    })
  }

  function renderStatistics() {
    if (loading) {
      return <span className='spinner-border spinner-border' />
    }
    return (
      <div className='next-release'>
        <Table bordered>
          <thead>
            <tr>
              <th className='roboto-bold'>
                <span>Statistikk</span>
              </th>
              <th className='roboto-bold'>
                <span>Om statistikken</span>
              </th>
              <th className='roboto-bold'>
                <span>Neste publisering</span>
              </th>
              <th />
              <th className='roboto-bold'>
                <span>Logg/sist oppdatert</span>
              </th>
            </tr>
          </thead>
          {getStatistics()}
        </Table>
        {openModal ? <RefreshStatisticsModal /> : null}
      </div>
    )
  }

  function makeRefreshButton(statistic) {
    return (
      <Button
        variant='primary'
        size='sm'
        className='mx-1'
        onClick={() => onRefreshStatistic(statistic)}
        disabled={statistic.loading}
      >
        {statistic.loading ? <span className='spinner-border spinner-border-sm' /> : <RefreshCw size={16} />}
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
            return statisticRow(statistic, index)
          })}
        </tbody>
      )
    }
    return <tbody />
  }

  function statisticRow(statistic, index) {
    const key = statistic.shortName + '_' + statistic.language + '_' + index
    return (
      <tr key={key}>
        <td className='statistic'>{getShortNameLink(statistic)}</td>
        <td>{getAboutStatisticLink(statistic)}</td>
        <td>{getNextRelease(statistic)}</td>
        <td className='text-center'>{makeRefreshButton(statistic)}</td>
        <td>{statistic.logData ? <StatisticsLog statisticId={statistic.id} /> : null}</td>
      </tr>
    )
  }

  function getNextRelease(statistic) {
    return (
      <span>
        {statistic.nextRelease ? <Moment format='DD.MM.YYYY HH:mm'>{statistic.nextRelease}</Moment> : null}
        {getStatregLinks(statistic)}
      </span>
    )
  }

  function editLink(statistic) {
    if (statistic.nextReleaseId) {
      const editUrl = internalBaseUrl + '/statistikkregisteret/publisering/edit/' + statistic.nextReleaseId
      return (
        <Link isExternal href={editUrl} title='Endre publisering i statistikkregisteret' className='ms-2'>
          [Endre]
        </Link>
      )
    }
    return null
  }

  function createLink(statistic) {
    if (statistic.statisticId && statistic.variantId) {
      const createUrl =
        statistic.activeVariants > 1
          ? internalBaseUrl + '/statistikkregisteret/statistikk/show/' + statistic.statisticId
          : internalBaseUrl +
            '/statistikkregisteret/publisering/create?statistikk.id=' +
            statistic.statisticId +
            '&variant.id=' +
            statistic.variantId
      return (
        <Link isExternal href={createUrl} title='Melde ny publisering i statistikkregisteret' className='ms-2'>
          [Meld]
        </Link>
      )
    }
    return null
  }

  function getStatregLinks(statistic) {
    return (
      <React.Fragment>
        {editLink(statistic)}
        {createLink(statistic)}
      </React.Fragment>
    )
  }

  function renderEditLink(statistic) {
    if (statistic.id) {
      return (
        <Link isExternal href={contentStudioBaseUrl + statistic.id}>
          {statistic.language === 'en' ? 'Eng. ' + statistic.shortName : statistic.shortName}
        </Link>
      )
    } else {
      return <span>{statistic.language === 'en' ? 'Eng. ' + statistic.shortName : statistic.shortName}</span>
    }
  }

  function renderPreviewLink(statistic) {
    if (statistic.previewUrl) {
      return (
        <Link isExternal title='Forhåndsvisning' href={statistic.previewUrl} className='ms-2'>
          [Forhåndsvisning]
        </Link>
      )
    }
  }

  function getShortNameLink(statistic) {
    return (
      <>
        {renderEditLink(statistic)}
        {renderPreviewLink(statistic)}
      </>
    )
  }

  function getAboutStatisticLink(statistic) {
    if (statistic.aboutTheStatistics) {
      return (
        <Link isExternal href={contentStudioBaseUrl + statistic.aboutTheStatistics}>
          {statistic.language === 'en' ? 'Eng. ' + 'Om statistikken' : 'Om statistikken'}
        </Link>
      )
    }
    return <span>{statistic.language === 'en' ? 'Eng. ' + 'Om statistikken' : 'Om statistikken'}</span>
  }

  return (
    <div className='p-4 tables-wrapper'>
      <h2 className='mb-3'>Kommende publiseringer</h2>
      {renderStatistics()}
    </div>
  )
}

export default (props) => <Statistics {...props} />
