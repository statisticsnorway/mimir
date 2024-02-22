import { actions } from '/react4xp/dashboard/containers/DataSources/slice'

export default function setupDataSourcesListeners(io, dispatch) {
  io.on('error-data-sources-result', (data) => {
    dispatch({
      type: actions.errorDataSourcesLoaded.type,
      dataSources: data,
    })
  })

  io.on('fact-page-groups-result', (data) => {
    dispatch({
      type: actions.factPageGroupsLoaded.type,
      factPageGroups: data,
    })
  })

  io.on('dashboard-activity-refreshDataset-result', (data) => {
    dispatch({
      type: actions.dataSourceLoaded.type,
      dataSource: data,
    })
  })

  io.on('dashboard-activity-refreshDataset', (data) => {
    dispatch({
      type: actions.dataSourceLoading.type,
      ids: [data.id],
    })
  })

  io.on('eventlog-node-result', (data) => {
    dispatch({
      type: actions.dataSourceEventLogLoaded.type,
      id: data.id,
      logs: data.logs,
    })
  })

  io.on('fact-page-data-sources-result', (data) => {
    dispatch({
      type: actions.factPageDataSourcesLoaded.type,
      id: data.id,
      dataSources: data.dataSources,
    })
  })

  io.on('statistics-groups-result', (data) => {
    dispatch({
      type: actions.statisticsGroupsLoaded.type,
      statisticsGroups: data,
    })
  })

  io.on('statistics-data-sources-result', (data) => {
    dispatch({
      type: actions.statisticsDataSourcesLoaded.type,
      id: data.id,
      dataSources: data.dataSources,
    })
  })

  io.on('municipal-groups-result', (data) => {
    dispatch({
      type: actions.municipalGroupsLoaded.type,
      municipalGroups: data,
    })
  })

  io.on('municipal-data-sources-result', (data) => {
    dispatch({
      type: actions.municipalDataSourcesLoaded.type,
      id: data.id,
      dataSources: data.dataSources,
    })
  })

  io.on('default-data-sources-result', (data) => {
    dispatch({
      type: actions.defaultDataSourcesLoaded.type,
      dataSources: data,
    })
  })
}
