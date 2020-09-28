import React from 'react'
import PropTypes from 'prop-types'
import Button from 'react-bootstrap/Button'
import { AlertTriangle, RefreshCw, Trash } from 'react-feather'
import { Link } from '@statisticsnorway/ssb-component-library'
import { DataQuery } from './Dashboard'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from 'react-bootstrap/Popover'
import moment from 'moment'
import Axios from 'axios'

const simpleDateFormat = (ds) =>
  moment(ds).locale('nb').format('DD.MM.YYYY HH:mm')

function decideType(type) {
  switch (type) {
  case 'mimir:keyFigure':
    return 'keyfigureType'
  case 'mimir:highchart':
    return 'highchartsType'
  case 'mimir:table':
    return 'tableType'
  default:
    return ''
  }
}

class DashboardDataQuery extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      deleting: false,
      eventLogNodes: [],
      loadingLogs: false
    }
  }

  requestDatasetUpdate(dataQueryId) {
    this.setLoading(dataQueryId, true)
    this.props.io.emit('dashboard-refresh-dataset', {
      ids: [dataQueryId]
    })
  }


  deleteDataset(dataQueryId) {
    this.setState({
      deleting: true
    })
    return this.resultHandler(this.props.deleteRequest(dataQueryId))
  }

  resultHandler() {
    this.setLoading(false)
  }

  setLoading(value) {
    this.props.setLoading(this.props.dataquery.id, value)
  }

  loadEventLogData() {
    this.setState({
      loadingLogs: true
    })
    Axios.get(this.props.fetchLogUrl, {
      params: {
        queryId: this.props.id
      }
    }) .then((response) => {
      this.setState({
        eventLogNodes: response.data
      })
    })
      .catch(function(error) {
        console.log(error)
      })
      .finally( () => {
        this.setState({
          loadingLogs: false
        })
      })
  }

  renderJobLogs() {
    if (this.state.loadingLogs === true) {
      return (
        <span className="spinner-border spinner-border" />
      )
    } else {
      return this.state.eventLogNodes.map((logNode, index) => this.renderLogNode(index, logNode))
    }
  }

  renderLogData() {
    const dataQueryId = this.props.dataquery.id
    const logData = this.props.dataquery.logData
    if (logData) {
      return (
        <td>
          {this.state.eventLogNodes &&
        <OverlayTrigger
          trigger="click"
          key={dataQueryId}
          placement="bottom"
          onToggle={(opening) => {
            if (opening) {
              this.loadEventLogData()
            }
          }}
          overlay={
            <Popover id={`popover-positioned-${dataQueryId}`}>
              <Popover.Title as="h3">Logg detaljer</Popover.Title>
              <Popover.Content className="ssbPopoverBody">
                {this.renderJobLogs()}
              </Popover.Content>
            </Popover>
          }
        >
          <span className="haveList">{logData.message ? logData.message : ''}</span>
        </OverlayTrigger>
          }
          {!logData.eventLogNodes && logData.message && <span>{logData.message}</span>}
          {logData.showWarningIcon && <span className="warningIcon"><AlertTriangle size="12" color="#FF4500"/></span>}<br/>
          {logData.modifiedReadable ? logData.modifiedReadable : ''}<br/>
          {logData.modified ? logData.modified : ''}<br/>
          {logData.by && logData.by.displayName ? `av ${logData.by.displayName}` : '' }
        </td>
      )
    } else return <td>no logs</td>
  }

  renderLogNode(i, logNode) {
    return (
      <p key={i}>
        <span>{logNode.modifiedTs}</span> - <span>{logNode.by}</span><br/>
        <span> &gt; {logNode.result}</span>
      </p>
    )
  }

  render() {
    const dataQuery = this.props.dataquery
    return (
      <tr className="small" >

        <td className={`${dataQuery.hasData ? 'ok' : 'error'} dataset`}>
          {dataQuery.displayName ?
            <Link href={this.props.contentStudioBaseUrl + dataQuery.id}>
              {dataQuery.displayName}
            </Link> : ''}
          { dataQuery.type ? <span className={'float-right detail ' + decideType(dataQuery.type)}>{dataQuery.type.split(':').pop()}</span> : '' }
          <span className={'float-right detail ' + dataQuery.format}>{dataQuery.format}</span>
          {!dataQuery.isPublished ? <span className={'float-right detail unpublished'}>Ikke publisert</span> : ''}
        </td>

        <td>
          { dataQuery.dataset.modifiedReadable ? dataQuery.dataset.modifiedReadable : ''}<br/>
          { dataQuery.dataset.modified ? simpleDateFormat(dataQuery.dataset.modified) : ''}
        </td>

        {dataQuery.logData ? this.renderLogData() : <td></td>}

        <td className="actions">
          <Button variant="secondary"
            size="sm"
            className="mx-1"
            onClick={() => this.deleteDataset(dataQuery.id)}
          >
            { this.state.deleting ? <span className="spinner-border spinner-border-sm" /> : <Trash size={16}/> }
          </Button>
          <Button varitant="primary"
            size="sm"
            className="mx-1"
            onClick={() => this.requestDatasetUpdate(dataQuery.id)}
          >
            { this.props.dataquery.loading ? <span className="spinner-border spinner-border-sm" /> : <RefreshCw size={16}/> }
          </Button>
        </td>
      </tr>)
  }
}

DashboardDataQuery.propTypes = {
  id: PropTypes.string,
  dataquery: PropTypes.shape(DataQuery),
  showError: PropTypes.func,
  fetchLogUrl: PropTypes.string,
  showSuccess: PropTypes.func,
  refreshRow: PropTypes.func,
  getRequest: PropTypes.func,
  deleteRequest: PropTypes.func,
  setLoading: PropTypes.func,
  contentStudioBaseUrl: PropTypes.string,
  io: PropTypes.object
}

export default (props) => <DashboardDataQuery {...props} />
