import { Accordion, NestedAccordion } from '@statisticsnorway/ssb-component-library'
import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectLoadingFactPageQueryGroups, selectFactPageQueryGroups } from './selectors'
import PropTypes from 'prop-types'
import { requestFactPageQueryGroups } from './actions'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'

export function FactPageQueries(props) {
  const [firstOpen, setFirstOpen] = React.useState(true)
  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()
  const isLoading = useSelector(selectLoadingFactPageQueryGroups)
  const factPages = useSelector(selectFactPageQueryGroups)

  function onToggleAccordion(isOpen) {
    if (firstOpen && isOpen) {
      setFirstOpen(false)
      requestFactPageQueryGroups(dispatch, io)
    }
  }

  function renderAccordionBody() {
    if (isLoading) {
      return (
        <span className="spinner-border spinner-border" />
      )
    }
    return (
      factPages.map((factPage) => {
        return (
          <NestedAccordion key={`fact-page-query-${factPage.id}`} header={`${factPage.displayName}`}>
            {factPage.id}
          </NestedAccordion>
        )
      })
    )
  }

  onToggleAccordion(props.openByDefault)
  return (
    <Accordion
      header="Spørringer fra Faktasider"
      className="mx-0"
      onToggle={(isOpen) => onToggleAccordion(isOpen)}
    >
      {renderAccordionBody()}
    </Accordion>
  )
}

FactPageQueries.defaultProps = {
  openByDefault: false
}

FactPageQueries.propTypes = {
  openByDefault: PropTypes.bool
}

export default (props) => <FactPageQueries {...props} />
