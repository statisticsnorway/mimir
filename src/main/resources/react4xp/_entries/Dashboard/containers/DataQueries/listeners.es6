import { actions } from './slice'

export default function setupDataQueriesListeners(io, dispatch) {
  io.on('error-queries-result', (data) => {
    dispatch({
      type: actions.errorQueriesLoaded.type,
      dataQueries: data
    })
  })

  io.on('fact-page-query-groups-result', (data) => {
    dispatch({
      type: actions.factPageQueryGroupsLoaded.type,
      factPageQueryGroups: data
    })
  })

  io.on('dashboard-activity-refreshDataset-result', (data) => {
    dispatch({
      type: actions.dataQueryLoaded.type,
      dataQuery: data
    })
  })

  io.on('dashboard-activity-refreshDataset', (data) => {
    dispatch({
      type: actions.dataQueryLoading.type,
      ids: [data.id]
    })
  })

  io.on('eventlog-node-result', (data) => {
    dispatch({
      type: actions.dataQueryEventLogLoaded.type,
      id: data.id,
      logs: data.logs
    })
  })

  io.on('fact-page-data-sources-result', (data) => {
    dispatch({
      type: actions.factPageDataSourcesLoaded.type,
      id: data.id,
      dataSources: data.dataSources
    })
  })

  io.on('statistics-groups-result', (data) => {
    dispatch({
      type: actions.statisticsGroupsLoaded.type,
      statisticsGroups: data
    })
  })

  io.on('statistics-data-sources-result', (data) => {
    dispatch({
      type: actions.statisticsDataSourcesLoaded.type,
      id: data.id,
      dataSources: data.dataSources
    })
  })

  io.on('municipal-groups-result', (data) => {
    dispatch({
      type: actions.municipalGroupsLoaded.type,
      municipalGroups: data
    })
  })

  io.on('municipal-data-sources-result', (data) => {
    dispatch({
      type: actions.municipalDataSourcesLoaded.type,
      id: data.id,
      dataSources: data.dataSources
    })
  })

  io.on('default-data-sources-result', (data) => {
    dispatch({
      type: actions.defaultDataSourcesLoaded.type,
      dataSources: data
    })
  })
}
