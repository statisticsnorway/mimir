import React, { useContext } from 'react'
import { requestDatasetUpdate } from '/react4xp/dashboard/containers/DataSources/actions'
import { RefreshCw } from 'react-feather'
import { Button } from '@statisticsnorway/ssb-component-library'
import { WebSocketContext } from '/react4xp/dashboard/utils/websocket/WebsocketProvider'
import { useDispatch, useSelector } from 'react-redux'
import { selectDataSourceById } from '/react4xp/dashboard/containers/DataSources/selectors'

interface RefreshDataSourceButtonProps {
  dataSourceId?: string;
}

export function RefreshDataSourceButton(props: RefreshDataSourceButtonProps) {
  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()
  const dataSource = useSelector(selectDataSourceById(props.dataSourceId))
  const { id, loading } = dataSource

  return (
    <Button primary size='sm' className='mx-1' onClick={() => requestDatasetUpdate(dispatch, io, [id])}>
      {loading ? <span className='spinner-border spinner-border-sm' /> : <RefreshCw size={16} />}
    </Button>
  )
}

export default (props) => <RefreshDataSourceButton {...props} />
