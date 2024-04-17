import { Accordion, NestedAccordion } from '@statisticsnorway/ssb-component-library'
import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectLoadingFactPageGroups,
  selectFactPageGroups,
  selectFactPageDataSources,
  selectFactPageLoading,
} from '/react4xp/dashboard/containers/DataSources/selectors'
import { requestFactPageGroups, requestFactPageDataSources } from '/react4xp/dashboard/containers/DataSources/actions'
import { WebSocketContext } from '/react4xp/dashboard/utils/websocket/WebsocketProvider'
import { DataSourceTable } from '/react4xp/dashboard/containers/DataSources/DataSourceTable'

interface FactPageDataSourcesProps {
  openByDefault?: boolean
}

export function FactPageDataSources(props: FactPageDataSourcesProps) {
  const [firstOpen, setFirstOpen] = React.useState(true)
  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()
  const isLoading = useSelector(selectLoadingFactPageGroups)
  const factPages = useSelector(selectFactPageGroups)

  function onToggleAccordion(isOpen) {
    if (firstOpen && isOpen) {
      setFirstOpen(false)
      requestFactPageGroups(dispatch, io)
    }
  }

  function renderDataSourceTable(factPage) {
    return (
      <DataSourceTable
        key={`fact-page-data-sources-${factPage.id}`}
        header={`${factPage.displayName}`}
        dataSourceSelector={selectFactPageDataSources(factPage.id)}
        loadingSelector={selectFactPageLoading(factPage.id)}
        requestDataSources={requestFactPageDataSources(factPage.id)}
        type={NestedAccordion}
      />
    )
  }

  function renderAccordionBody() {
    if (isLoading) {
      return <span className='spinner-border spinner-border' />
    }
    return factPages.map((factPage) => renderDataSourceTable(factPage))
  }

  onToggleAccordion(props.openByDefault)
  return (
    <Accordion header='Spørringer fra Faktasider' className='mx-0' onToggle={(isOpen) => onToggleAccordion(isOpen)}>
      {renderAccordionBody()}
    </Accordion>
  )
}

FactPageDataSources.defaultProps = {
  openByDefault: false,
}

export default (props) => <FactPageDataSources {...props} />
