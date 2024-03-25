import { Accordion, NestedAccordion } from '@statisticsnorway/ssb-component-library'
import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectMunicipalGroups,
  selectLoadingMunicipalGroups,
  selectMunicipalDataSources,
  selectMunicipalLoading,
} from '/react4xp/dashboard/containers/DataSources/selectors'
import { requestMunicipalGroups, requestMunicipalDataSources } from '/react4xp/dashboard/containers/DataSources/actions'
import { WebSocketContext } from '/react4xp/dashboard/utils/websocket/WebsocketProvider'
import { DataSourceTable } from '/react4xp/dashboard/containers/DataSources/DataSourceTable'

interface MunicipalDataSourcesProps {
  openByDefault?: boolean
}

export function MunicipalDataSources(props: MunicipalDataSourcesProps) {
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

export default (props) => <MunicipalDataSources {...props} />
