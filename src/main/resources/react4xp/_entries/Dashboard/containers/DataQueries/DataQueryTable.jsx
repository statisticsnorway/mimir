import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { Button } from 'react-bootstrap'
import { selectDataQueriesByParentType, selectDataQueriesByType } from './selectors'
import { Accordion, Link } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { requestDatasetUpdate } from './actions'
import { RefreshCw } from 'react-feather'
import { selectContentStudioBaseUrl } from '../HomePage/selectors'
import { ReactTable } from '../../components/ReactTable'
import { DataQueryBadges } from '../../components/DataQueryBadges'
import { DataQueryLog } from './DataQueryLog'
import { RefreshDataQueryButton } from './RefreshDataQueryButton'

export function DataQueryTable(props) {
  const dataQueries = props.dataQueryType ?
    useSelector(selectDataQueriesByParentType(props.dataQueryType)) :
    useSelector(selectDataQueriesByType('mimir:statistics'))
  const contentStudioBaseUrl = useSelector(selectContentStudioBaseUrl)
  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()

  function updateAll() {
    const ids = dataQueries.filter((q) => !q.loading).map((q) => q.id)
    requestDatasetUpdate(dispatch, io, ids)
  }

  const anyLoading = dataQueries.filter((q) => q.loading).length > 0

  const columns = React.useMemo(() => [
    {
      Header: 'Spørring ',
      accessor: 'dataQuery',
      sortType: (a, b) => {
        return a.original.dataQuerySort > b.original.dataQuerySort ? 1 : -1
      }
    },
    {
      Header: 'Sist oppdatert ',
      accessor: 'lastUpdated',
      sortType: (a, b) => {
        return a.original.lastUpdatedSort > b.original.lastUpdatedSort ? 1 : -1
      }
    },
    {
      Header: 'Siste aktivitet ',
      accessor: 'lastActivity',
      sortType: (a, b) => {
        return a.original.lastActivitySort > b.original.lastActivitySort ? 1 : -1
      }
    },
    {
      Header: '',
      accessor: 'refreshDataQuery',
      disableSortBy: true
    }
  ], [])

  function getDataQueries(dataQueries) {
    return dataQueries.map((dataQuery) => {
      return {
        dataQuery: (
          <span className={`${dataQuery.hasData ? 'ok' : 'error'} dataset`}>
            <Link isExternal href={contentStudioBaseUrl + dataQuery.id}>{dataQuery.displayName}</Link>
            <DataQueryBadges contentType={dataQuery.type} format={dataQuery.format} isPublished={dataQuery.isPublished}/>
          </span>
        ),
        dataQuerySort: dataQuery.displayName.toLowerCase(),
        lastUpdated: (
          <span>
            {dataQuery.dataset.modifiedReadable ? dataQuery.dataset.modifiedReadable : ''}
            <br/>
            {dataQuery.dataset.modified ? dataQuery.dataset.modified : ''}
          </span>
        ),
        lastUpdatedSort: dataQuery.dataset && dataQuery.dataset.modified ? new Date(dataQuery.dataset.modified) : new Date('01.01.1970'),
        lastActivity: (
          <DataQueryLog dataQueryId={dataQuery.id} />
        ),
        lastActivitySort: dataQuery.logData && dataQuery.logData.modified ? new Date(dataQuery.logData.modified) : new Date('01.01.1970'),
        refreshDataQuery: (
          <RefreshDataQueryButton dataQueryId={dataQuery.id} />
        )
      }
    })
  }
  const data = React.useMemo(() => getDataQueries(dataQueries), [])

  return (
    <Accordion header={`${props.header} (${dataQueries.length})`} className="mx-0" openByDefault={!!props.openByDefault}>
      <Button className="mb-3" onClick={() => updateAll()}>
        Oppdater liste
        {anyLoading ? <span className="spinner-border spinner-border-sm ml-2 mb-1" /> : <RefreshCw className="ml-2" />}
      </Button>
      <ReactTable columns={columns} data={data} />
    </Accordion>
  )
}

DataQueryTable.propTypes = {
  dataQueryType: PropTypes.string,
  contentType: PropTypes.string,
  header: PropTypes.string,
  openByDefault: PropTypes.bool
}

export default (props) => <DataQueryTable {...props} />
