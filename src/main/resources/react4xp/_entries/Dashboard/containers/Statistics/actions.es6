import { actions } from './slice'

export function requestStatistics(dispatch, io) {
  dispatch({
    type: actions.loadStatistics.type
  })

  io.emit('get-statistics')
}

export function requestStatisticsSearchList(dispatch, io) {
  dispatch({
    type: actions.loadStatisticsSearchList.type
  })

  io.emit('get-statistics-search-list')
}

export function refreshStatistic(dispatch, io, id, owners) {
  dispatch({
    type: actions.startRefreshStatistic.type,
    id
  })

  io.emit('refresh-statistic', {
    id,
    owners
  })
}

export function setOpenStatistic(dispatch, io, statistic) {
  dispatch({
    type: actions.setOpenStatistic.type,
    id: statistic ? statistic.id : null
  })

  if (statistic && !statistic.loadingOwnersWithSources && !statistic.ownersWithSources) {
    fetchOwnersWithSources(dispatch, io, statistic.id, statistic.relatedTables.map((t) => t.queryId))
  }
}

export function resetRefreshStatus(dispatch, status) {
  dispatch({
    type: actions.resetRefreshStatus.type,
    status
  })
}

export function setOpenModal(dispatch, status) {
  dispatch({
    type: actions.setOpenModal.type,
    status
  })
}

export function fetchOwnersWithSources(dispatch, io, id, dataSourceIds) {
  dispatch({
    type: actions.loadStatisticsOwnersWithSources.type,
    id
  })

  io.emit('get-statistics-owners-with-sources', {
    id,
    dataSourceIds
  })
}
