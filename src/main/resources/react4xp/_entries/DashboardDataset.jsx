import React from 'react'
import { Accordion, Button as SSBButton } from '@statisticsnorway/ssb-component-library'
import { Trash, Download } from 'react-feather';
import PropTypes from 'prop-types'
import { Button, Col, Row, Table } from 'react-bootstrap'
import { Dialog } from 'react-bootstrap-easy-dialog'
import axios from 'axios';

class DashboardDataset extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataQueries: []
    }
  }
  componentDidMount() {
    this.setState({
      dataQueries: this.props.dataQueries
    })
  }

  showSuccess(msg) {
    console.log(msg)
  }

  showError(msg) {
    console.log(msg)
  }

  showDeleteAllDialog(){
    const confirmed = dialog.confirm('Vil du slette alle dataset?');
    console.log(confirmed);
  }

  deleteAllDataset() {
    axios.delete(this.props.dashboardService, {
      params: {
        id: '*'
      }
    })
    .then((response) => {
      if (response.data.success) {
        this.showSuccess(response.data.message)
        this.setState({
          dataQueries: response.data.updates
        })
      } else {
        this.showError(response.data.message)
      }
    })
    .catch((e) => {
      this.showError(e.response.data.message)
    })
    .finally(() => {

    })
  }

  renderDataQueries() {
    const { dataQueries } = this.props
    return(
      dataQueries.map( (set) => {
          return (<tr key={set.id}
                      className="small"
          >
            <td className="{set.class} dataset">{set.displayName}</td>
            <td>{set.updated}</td>
            <td>{set.updatedHumanReadable}</td>
            <td className="actions">
              <Button variant="secondary" size="sm"
                      data-action="delete"
              >
                <Trash size={16}/>
              </Button>
              <Button varitant="primary" size="sm"
                      data-action="refresh"
              >
                <Download size={16}/>
              </Button>
            </td>
          </tr>)
        })
    )
  }

  renderTable() {
    return (
      <Table bordered striped>
        <thead>
          <tr>
            <th className="roboto-bold">Spørring</th>
            <th className="roboto-bold">Sist oppdatert</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
        {this.renderDataQueries()}
        </tbody>
      </Table>
    )
  }

  renderAccordians() {
    const { header } = this.props
    return (
      <Accordion header={header} className="mx-0 mt-4">
        {this.renderTable()}
      </Accordion>
    )
  }

  renderFooter() {
    return (
      <nav className="footerNavigation">
        <SSBButton
          secondary
          className="mt-3 js-dashboard-delete pb-2"
          onClick={() => this.showDeleteAllDialog()}>
          Slett alle dataset
          <span className="d-none ml-1 my-1 spinner-border spinner-border-sm" role="status">
              <span className="sr-only">Sletter...</span>
            </span>
        </SSBButton>
        <SSBButton primary className="ml-2 mt-3 js-dashboard-update pb-2">
          Oppdater alle dataset
          <span className="d-none ml-1 my-1 spinner-border spinner-border-sm" role="status">
              <span className="sr-only">Loading...</span>
            </span>
        </SSBButton>
      </nav>
    )
  }

  render() {
    return (
      <section className="xp-part part-dashboard">
        <Row className="mt-3">
          <Col className="col-lg-12">
            <div className="p-4 tables-wrapper">
              <h2 className="mb-3">
                {`Spørringer mot statistikkbank og tabellbygger (${this.props.dataQueries.length} stk)`}
              </h2>
              {this.renderAccordians()}
            </div>
          </Col>
        </Row>
        {this.renderFooter()}
        <div className="alert alert-danger alert-dismissible fade show d-none" role="alert">
          <p>Error message</p>
          <button type="button" className="close" aria-label="Close">
            <span aria-hidden="true">-</span>
          </button>
        </div>
        <div className="alert alert-success alert-dismissible fade show d-none" role="alert">
          <p>Success message</p>
          <button type="button" className="close" aria-label="Close">
            <span aria-hidden="true"></span>
          </button>
        </div>
      </section>
    )
  }

}


DashboardDataset.propTypes = {
  header: PropTypes.string,
  dashboardService: PropTypes.string,
  dataQueries: PropTypes.arrayOf(
    PropTypes.shape({
      displayName: PropTypes.string,
      class: PropTypes.string,
      updated: PropTypes.string,
      updatedHumanReadable: PropTypes.string,
      hasData: PropTypes.boolean
    })
  )
}

export default (props) => <DashboardDataset {...props} />
