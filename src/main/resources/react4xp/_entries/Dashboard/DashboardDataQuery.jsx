import React from 'react'
import PropTypes from 'prop-types'
import Button from 'react-bootstrap/Button'
import { AlertTriangle, RefreshCw, Trash } from 'react-feather'
import { Link } from '@statisticsnorway/ssb-component-library'
import { DataQuery } from './Dashboard'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from 'react-bootstrap/Popover'
import moment from 'moment'

const simpleDateFormat = (ds) =>
  moment(ds).locale('nb').format('DD.MM.YYYY HH:mm')

class DashboardDataQuery extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      deleting: false
    }
  }

  getDataset(dataQueryId) {
    this.setLoading(true)
    this.resultHandler(this.props.getRequest(dataQueryId))
  }

  deleteDataset(dataQueryId) {
    this.setState({
      deleting: true
    })
    return this.resultHandler(this.props.deleteRequest(dataQueryId))
  }

  resultHandler(p) {
    return p.then((response) => {
      if (response.status === 200) {
        this.props.refreshRow(response.data.updates)
        this.props.showSuccess(response.data.message)
      } else {
        this.props.showError(response.data.message)
      }
    })
      .catch((e) => {
        console.log(e)
        this.props.refreshRow(e.response.data.updates)
        this.props.showError(e.response.data.message)
      })
      .finally(() => {
        this.setState({
          deleting: false
        })
        this.setLoading(false)
      })
  }

  setLoading(value) {
    this.props.setLoading(this.props.dataquery.id, value)
  }

  renderLogData() {
    const dataQueryId = this.props.dataquery.id
    const logData = this.props.dataquery.logData
    return (
      <td>
        {logData.eventLogNodes &&
        <OverlayTrigger
          trigger="click"
          key={dataQueryId}
          placement="bottom"
          overlay={
            <Popover id={`popover-positioned-${dataQueryId}`}>
              <Popover.Title as="h3">Logg detaljer</Popover.Title>
              <Popover.Content className="ssbPopoverBody">
                {logData.eventLogNodes.map((logNode, index) => this.renderLogNode(index, logNode))}
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
          <span className={'float-right detail ' + dataQuery.format}>{dataQuery.format}</span>
          {!dataQuery.isPublished ? <span className={'float-right detail unpublished'}>Ikke publisert</span> : ''}
        </td>

        <td>
          { dataQuery.dataset.modifiedReadable ? dataQuery.dataset.modifiedReadable : ''}<br/>
          { dataQuery.dataset.modified ? simpleDateFormat(dataQuery.dataset.modified) : ''}
        </td>

        {dataQuery.logData ? this.renderLogData(): <td></td>}

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
            onClick={() => this.getDataset(dataQuery.id)}
          >
            { this.props.dataquery.loading ? <span className="spinner-border spinner-border-sm" /> : <RefreshCw size={16}/> }
          </Button>
        </td>
      </tr>)
  }
}

DashboardDataQuery.propTypes = {
  dataquery: PropTypes.shape(DataQuery),
  showError: PropTypes.func,
  showSuccess: PropTypes.func,
  refreshRow: PropTypes.func,
  getRequest: PropTypes.func,
  deleteRequest: PropTypes.func,
  setLoading: PropTypes.func,
  contentStudioBaseUrl: PropTypes.string
}

export default (props) => <DashboardDataQuery {...props} />
