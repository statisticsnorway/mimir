import {Alert, Button} from 'react-bootstrap';
import {Download, Loader, Trash} from 'react-feather';
import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

class DashboardDataQuery extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <tr className="small" >
        <td className={`${this.props.hasData ? 'ok' : 'error'} dataset`}>
          {this.props.displayName}
          {this.props.errorMsg ? <span className="errorMsg">{this.props.errorMsg}</span> : ''}
        </td>
        <td>{this.props.updated}</td>
        <td>{this.props.updatedHumanReadable}</td>
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
