import { Accordion, NestedAccordion } from '@statisticsnorway/ssb-component-library'
import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectLoadingFactPageGroups,
  selectFactPageGroups,
  selectFactPageDataSources,
  selectFactPageLoading,
} from './selectors'
import PropTypes from 'prop-types'
import { requestFactPageGroups, requestFactPageDataSources } from './actions'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { DataSourceTable } from './DataSourceTable'

export function FactPageDataSources(props) {
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

FactPageDataSources.propTypes = {
  openByDefault: PropTypes.bool,
}

export default (props) => <FactPageDataSources {...props} />
