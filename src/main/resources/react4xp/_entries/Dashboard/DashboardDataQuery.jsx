import Button from 'react-bootstrap/Button'
import { Download, Trash } from 'react-feather'
import { Link } from '@statisticsnorway/ssb-component-library'
import React from 'react'
import PropTypes from 'prop-types'

class DashboardDataQuery extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <tr className="small" >
        <td className={`${this.props.hasData ? 'ok' : 'error'} dataset`}>
          {
            this.props.displayName ? <Link href={this.props.contentStudioBaseUrl + this.props.id}>
                {this.props.displayName}
              </Link> : ''
          }
          <span className={'float-right detail ' + this.props.format}>{this.props.format}</span>
          {!this.props.isPublished ? <span className={'float-right detail unpublished'}>Ikke publisert</span> : ''}
          {this.props.errorMsg ? <span className="errorMsg">{this.props.errorMsg}</span> : ''}
        </td>

        <td>
          {this.props.datasetModifiedReadable ? this.props.datasetModifiedReadable : ''}<br/>
          {this.props.datasetModified ? this.props.datasetModified : ''}
        </td>
        <td>
          {this.props.message ? this.props.message : ''}<br/>
          {this.props.modifiedReadable ? this.props.modifiedReadable : ''}<br/>
          {this.props.modified ? this.props.modified : ''}<br/>
          {this.props.by ? `av ${this.props.by}` : '' }
        </td>
        <td className="actions">
          <Button variant="secondary"
            size="sm"
            onClick={() => this.props.deleteDataset(this.props.id)}
          >
            { this.props.deleting ? <span className="spinner-border spinner-border-sm" /> : <Trash size={16}/> }
          </Button>
          <Button varitant="primary"
            size="sm"
            onClick={() => this.props.getDataset(this.props.id)}
          >
            { this.props.loading ? <span className="spinner-border spinner-border-sm" /> : <Download size={16}/> }
          </Button>
        </td>
      </tr>)
  }
}

DashboardDataQuery.propTypes = {
  id: PropTypes.string,
  displayName: PropTypes.string,
  format: PropTypes.string,
  isPublished: PropTypes.bool,
  class: PropTypes.string,
  newDatasetData: PropTypes.bool,
  datasetModified: PropTypes.string,
  datasetModifiedReadable: PropTypes.string,
  showError: PropTypes.bool,
  showSuccess: PropTypes.bool,
  errorMsg: PropTypes.string,
  hasData: PropTypes.bool,
  loading: PropTypes.bool,
  deleting: PropTypes.bool,
  dashboardService: PropTypes.string,
  deleteDataset: PropTypes.func,
  getDataset: PropTypes.func,
  status: PropTypes.string,
  modifiedReadable: PropTypes.string,
  modified: PropTypes.string,
  message: PropTypes.string,
  by: PropTypes.string,
  contentStudioBaseUrl: PropTypes.string
}

export default (props) => <DashboardDataQuery {...props} />
