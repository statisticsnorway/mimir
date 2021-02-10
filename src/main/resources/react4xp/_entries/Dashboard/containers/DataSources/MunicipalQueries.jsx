import { Accordion, NestedAccordion } from '@statisticsnorway/ssb-component-library'
import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectMunicipalGroups,
  selectLoadingMunicipalGroups,
  selectMunicipalDataSources,
  selectMunicipalLoading } from './selectors'
import PropTypes from 'prop-types'
import { requestMunicipalGroups, requestMunicipalDataSources } from './actions'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { DataQueryTable } from './DataQueryTable'

export function MunicipalQueries(props) {
  const [firstOpen, setFirstOpen] = React.useState(true)
  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()
  const isLoading = useSelector(selectLoadingMunicipalGroups)
  const municipals = useSelector(selectMunicipalGroups)

  function onToggleAccordion(isOpen) {
    if (firstOpen && isOpen) {
      setFirstOpen(false)
      requestMunicipalGroups(dispatch, io)
    }
  }

  function renderDataQueryTable(municipal) {
    return (
      <DataQueryTable
        key={`municipal-query-${municipal.id}`}
        header={`${municipal.displayName}`}
        querySelector={selectMunicipalDataSources(municipal.id)}
        loadingSelector={selectMunicipalLoading(municipal.id)}
        requestQueries={requestMunicipalDataSources(municipal.id)}
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
      municipals.map((municipal) => renderDataQueryTable(municipal))
    )
  }

  onToggleAccordion(props.openByDefault)
  return (
    <Accordion
      header="Spørringer fra Kommunefakta"
      className="mx-0"
      onToggle={(isOpen) => onToggleAccordion(isOpen)}
    >
      {renderAccordionBody()}
    </Accordion>
  )
}

MunicipalQueries.defaultProps = {
  openByDefault: false
}

MunicipalQueries.propTypes = {
  openByDefault: PropTypes.bool
}

export default (props) => <MunicipalQueries {...props} />
