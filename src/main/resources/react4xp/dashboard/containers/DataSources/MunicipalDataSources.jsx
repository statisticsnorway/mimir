import { Accordion, NestedAccordion } from '@statisticsnorway/ssb-component-library'
import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectMunicipalGroups,
  selectLoadingMunicipalGroups,
  selectMunicipalDataSources,
  selectMunicipalLoading,
} from './selectors'
import PropTypes from 'prop-types'
import { requestMunicipalGroups, requestMunicipalDataSources } from './actions'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { DataSourceTable } from './DataSourceTable'

export function MunicipalDataSources(props) {
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

  function renderDataSourceTable(municipal) {
    return (
      <DataSourceTable
        key={`municipal-data-source-${municipal.id}`}
        header={`${municipal.displayName}`}
        dataSourceSelector={selectMunicipalDataSources(municipal.id)}
        loadingSelector={selectMunicipalLoading(municipal.id)}
        requestDataSources={requestMunicipalDataSources(municipal.id)}
        type={NestedAccordion}
      />
    )
  }

  function renderAccordionBody() {
    if (isLoading) {
      return <span className='spinner-border spinner-border' />
    }
    return municipals.map((municipal) => renderDataSourceTable(municipal))
  }

  onToggleAccordion(props.openByDefault)
  return (
    <Accordion header='Spørringer fra Kommunefakta' className='mx-0' onToggle={(isOpen) => onToggleAccordion(isOpen)}>
      {renderAccordionBody()}
    </Accordion>
  )
}

MunicipalDataSources.defaultProps = {
  openByDefault: false,
}

MunicipalDataSources.propTypes = {
  openByDefault: PropTypes.bool,
}

export default (props) => <MunicipalDataSources {...props} />
