import { actions } from './slice'

export function requestStatistics(dispatch, io) {
  dispatch({
    type: actions.loadStatistics.type,
  })

  io.emit('get-statistics')
}

export function requestStatisticsSearchList(dispatch, io) {
  dispatch({
    type: actions.loadStatisticsSearchList.type,
  })

  io.emit('get-statistics-search-list')
}

export function refreshStatistic(dispatch, io, id, owners) {
  dispatch({
    type: actions.startRefreshStatistic.type,
    id,
  })

  io.emit('refresh-statistic', {
    id,
    owners,
  })
}

export function setOpenStatistic(dispatch, io, statistic) {
  dispatch({
    type: actions.setOpenStatistic.type,
    id: statistic ? statistic.id : null,
  })

  // always fetch related tables and owners with sources every time the modal is opened, just in case it changed
  if (statistic) {
    if (!statistic.loadingRelatedTablesAndOwnersWithSources) {
      fetchRelatedTablesAndOwnersWithSources(dispatch, io, statistic.id)
    }
  }
}

export function resetRefreshStatus(dispatch, status) {
  dispatch({
    type: actions.resetRefreshStatus.type,
    status,
  })
}

export function setOpenModal(dispatch, status) {
  dispatch({
    type: actions.setOpenModal.type,
    status,
  })
}

export function setModal(dispatch, modal) {
  dispatch({
    type: actions.setModal.type,
    modal,
  })
}

export function resetModal(dispatch, id) {
  dispatch({
    type: actions.resetModal.type,
    id,
  })
}

export function fetchOwnersWithSources(dispatch, io, id, dataSourceIds) {
  dispatch({
    type: actions.loadStatisticsOwnersWithSources.type,
    id,
  })

  io.emit('get-statistics-owners-with-sources', {
    id,
    dataSourceIds,
  })
}

export function fetchRelatedTablesAndOwnersWithSources(dispatch, io, id) {
  dispatch({
    type: actions.loadStatisticsRelatedTables.type,
    id,
  })

  io.emit('get-statistics-related-tables-and-owners-with-sources', {
    id,
  })
}

export function requestStatisticsJobLog(dispatch, io, id) {
  io.emit('get-statistics-job-log', {
    id,
  })
}

export function requestJobLogDetails(dispatch, io, jobLogId, statisticId) {
  io.emit('get-statistic-job-log-details', {
    id: jobLogId,
    statisticId,
  })
}
