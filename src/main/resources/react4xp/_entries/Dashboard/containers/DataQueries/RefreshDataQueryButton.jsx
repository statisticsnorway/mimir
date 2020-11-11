import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { requestDatasetUpdate } from './actions'
import { RefreshCw } from 'react-feather'
import { Button } from 'react-bootstrap'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { useDispatch, useSelector } from 'react-redux'
import { selectDataQueriesById } from './selectors'

export function RefreshDataQueryButton(props) {
  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()
  const dataQuery = useSelector(selectDataQueriesById(props.dataQueryId))
  const {
    id,
    loading
  } = dataQuery

  return (
    <Button variant="primary"
      size="sm"
      className="mx-1"
      onClick={() => requestDatasetUpdate(dispatch, io, [id])}
    >
      {loading ? <span className="spinner-border spinner-border-sm"/> : <RefreshCw size={16}/>}
    </Button>
  )
}

RefreshDataQueryButton.propTypes = {
  dataQueryId: PropTypes.string
}

export default (props) => <RefreshDataQueryButton {...props} />
