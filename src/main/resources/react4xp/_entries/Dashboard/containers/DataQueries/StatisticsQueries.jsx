import { Accordion, NestedAccordion } from '@statisticsnorway/ssb-component-library'
import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectStatisticsGroups,
  selectLoadingStatisticsGroups,
  selectStatisticsDataSources,
  selectStatisticsLoading } from './selectors'
import PropTypes from 'prop-types'
import { requestStatisticsGroups, requestStatisticsDataSources } from './actions'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { DataQueryTable } from './DataQueryTable'

export function StatisticsQueries(props) {
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

  function renderDataQueryTable(statistic) {
    return (
      <DataQueryTable
        key={`statistics-query-${statistic.id}`}
        header={`${statistic.displayName}`}
        querySelector={selectStatisticsDataSources(statistic.id)}
        loadingSelector={selectStatisticsLoading(statistic.id)}
        requestQueries={requestStatisticsDataSources(statistic.id)}
        type={NestedAccordion}
      />
    )
  }

  function renderAccordionBody() {
    if (isLoading) {
      return (
        <span className="spinner-border spinner-border" />
      )
    }
    return (
      statistics.map((statistic) => renderDataQueryTable(statistic))
    )
  }

  onToggleAccordion(props.openByDefault)
  return (
    <Accordion
      header="Spørringer fra Statistikker"
      className="mx-0"
      onToggle={(isOpen) => onToggleAccordion(isOpen)}
    >
      {renderAccordionBody()}
    </Accordion>
  )
}

StatisticsQueries.defaultProps = {
  openByDefault: false
}

StatisticsQueries.propTypes = {
  openByDefault: PropTypes.bool
}

export default (props) => <StatisticsQueries {...props} />
