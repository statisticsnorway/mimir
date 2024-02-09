import { Accordion, NestedAccordion } from '@statisticsnorway/ssb-component-library'
import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectStatisticsGroups,
  selectLoadingStatisticsGroups,
  selectStatisticsDataSources,
  selectStatisticsLoading,
} from '/react4xp/dashboard/containers/DataSources/selectors'
import PropTypes from 'prop-types'
import {
  requestStatisticsGroups,
  requestStatisticsDataSources,
} from '/react4xp/dashboard/containers/DataSources/actions'
import { WebSocketContext } from '/react4xp/dashboard/utils/websocket/WebsocketProvider'
import { DataSourceTable } from '/react4xp/dashboard/containers/DataSources/DataSourceTable'

export function StatisticsDataSources(props) {
  const [firstOpen, setFirstOpen] = React.useState(true)
  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()
  const isLoading = useSelector(selectLoadingStatisticsGroups)
  const statistics = useSelector(selectStatisticsGroups)

  function onToggleAccordion(isOpen) {
    if (firstOpen && isOpen) {
      setFirstOpen(false)
      requestStatisticsGroups(dispatch, io)
    }
  }

  function renderDataSourceTable(statistic) {
    return (
      <DataSourceTable
        key={`statistics-data-sources-${statistic.id}`}
        header={`${statistic.displayName}`}
        dataSourceSelector={selectStatisticsDataSources(statistic.id)}
        loadingSelector={selectStatisticsLoading(statistic.id)}
        requestDataSources={requestStatisticsDataSources(statistic.id)}
        type={NestedAccordion}
      />
    )
  }

  function renderAccordionBody() {
    if (isLoading) {
      return <span className='spinner-border spinner-border' />
    }
    return statistics.map((statistic) => renderDataSourceTable(statistic))
  }

  onToggleAccordion(props.openByDefault)
  return (
    <Accordion header='Spørringer fra Statistikker' className='mx-0' onToggle={(isOpen) => onToggleAccordion(isOpen)}>
      {renderAccordionBody()}
    </Accordion>
  )
}

StatisticsDataSources.defaultProps = {
  openByDefault: false,
}

StatisticsDataSources.propTypes = {
  openByDefault: PropTypes.bool,
}

export default (props) => <StatisticsDataSources {...props} />
