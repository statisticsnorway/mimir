import Button from 'react-bootstrap/Button';
import {Download, Loader, Trash} from 'react-feather';
import { Link } from '@statisticsnorway/ssb-component-library'
import React from 'react';
import PropTypes from 'prop-types';

class DashboardDataQuery extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <tr className="small" >
        <td className={`${this.props.hasData ? 'ok' : 'error'} dataset`}>
            {this.props.displayName ? <Link href={'/admin/tool/com.enonic.app.contentstudio/main#/edit/' + this.props.id}>{this.props.displayName}</Link> : ''}
            <span className={'float-right detail ' + this.props.format}>{this.props.format}</span>
            {!this.props.isPublished?<span className={'float-right detail published_' + this.props.isPublished}>Ikke publisert</span> : ''}
            {this.props.errorMsg ? <span className="errorMsg">{this.props.errorMsg}</span> : ''}
        </td>
        <td>{this.props.updated ? this.props.updated : ''}</td>
        <td>{this.props.updatedHumanReadable ? this.props.updatedHumanReadable : ''}</td>
        <td className="actions">
          <Button variant="secondary"
            size="sm"
            onClick={() => this.props.deleteDataset(this.props.id)}
          >
            { this.props.deleting ?  <span className="spinner-border spinner-border-sm" /> : <Trash size={16}/> }
          </Button>
          <Button varitant="primary"
            size="sm"
            onClick={() => this.props.getDataset(this.props.id)}
          >
            { this.props.loading ?  <span className="spinner-border spinner-border-sm" /> : <Download size={16}/> }
          </Button>
        </td>
      </tr>)
  }
}

DashboardDataQuery.propTypes = {
  id: PropTypes.string,
  displayName: PropTypes.string,
  format: PropTypes.string,
  isPublished: PropTypes.string,
  class: PropTypes.string,
  updated: PropTypes.string,
  updatedHumanReadable: PropTypes.string,
  showError: PropTypes.bool,
  showSuccess: PropTypes.bool,
  errorMsg: PropTypes.string,
  hasData: PropTypes.bool,
  loading: PropTypes.bool,
  deleting: PropTypes.bool,
  dashboardService: PropTypes.string,
  deleteDataset: PropTypes.func,
  getDataset: PropTypes.func,
  status: PropTypes.string
}

export default (props) => <DashboardDataQuery {...props} />
