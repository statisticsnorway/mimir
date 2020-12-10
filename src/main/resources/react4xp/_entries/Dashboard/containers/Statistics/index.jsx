import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Table } from 'react-bootstrap'
import { selectStatisticsWithRelease,
  selectLoading,
  selectOpenModal } from './selectors'
import { RefreshCw } from 'react-feather'
import Moment from 'react-moment'
import { Link } from '@statisticsnorway/ssb-component-library'
import { selectContentStudioBaseUrl } from '../HomePage/selectors'
import { setOpenStatistic, setOpenModal } from './actions'

import { StatisticsLog } from './StatisticsLog'
import { selectLoading as selectQueryLoading } from '../DataQueries/selectors'
import { RefreshStatisticsModal } from '../../components/RefreshStatisticsModal'

export function Statistics() {
  const statistics = useSelector(selectStatisticsWithRelease)
  const loading = useSelector(selectLoading)
  const loadingQueries = useSelector(selectQueryLoading)
  const contentStudioBaseUrl = useSelector(selectContentStudioBaseUrl)
  const openModal = useSelector(selectOpenModal)

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
    setOpenStatistic(dispatch, statistic.id)
    setOpenModal(dispatch, true)
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

  function renderLog(statistic) {
    if (loadingQueries) {
      return <span className="spinner-border spinner-border-sm"/>
    }
    return (
      <StatisticsLog statisticsShortName={statistic.shortName} relatedTables={statistic.relatedTables ? statistic.relatedTables : []}/>
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
        <td>
          {renderLog(statistic)}
        </td>
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
