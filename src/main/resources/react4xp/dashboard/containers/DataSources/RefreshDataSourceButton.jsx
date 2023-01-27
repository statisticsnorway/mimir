import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { requestDatasetUpdate } from '/react4xp/dashboard/containers/DataSources/actions'
import { RefreshCw } from 'react-feather'
import { Button } from 'react-bootstrap'
import { WebSocketContext } from '/react4xp/dashboard/utils/websocket/WebsocketProvider'
import { useDispatch, useSelector } from 'react-redux'
import { selectDataSourceById } from '/react4xp/dashboard/containers/DataSources/selectors'

export function RefreshDataSourceButton(props) {
  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()
  const dataSource = useSelector(selectDataSourceById(props.dataSourceId))
  const { id, loading } = dataSource

  return (
    <Button variant='primary' size='sm' className='mx-1' onClick={() => requestDatasetUpdate(dispatch, io, [id])}>
      {loading ? <span className='spinner-border spinner-border-sm' /> : <RefreshCw size={16} />}
    </Button>
  )
}

RefreshDataSourceButton.propTypes = {
  dataSourceId: PropTypes.string,
}

export default (props) => <RefreshDataSourceButton {...props} />
