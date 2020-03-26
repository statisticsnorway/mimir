import React from 'react'
import { Accordion, Button as SSBButton } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Table from 'react-bootstrap/Table'
import DashboardDataQuery from './DashboardDataQuery'

class Dashboard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataQueries: props.dataQueries,
      showDeleteAllDialog: false,
      showDownloadAllDialog: false,
      downloadingAll: false,
      deletingAll: false,
      errorMsg: '',
      successMsg: '',
      showErrorAlert: false,
      showSuccessAlert: false
    }
  }

  renderDataQueries() {
    return this.state.dataQueries.map( (query) => {
      return (
        <DashboardDataQuery key={query.id}
                            id={query.id}
                            displayName={query.displayName}
                            updated={query.updated}
                            updatedHumanReadable={query.updatedHumanReadable}
                            hasData={query.hasData}
                            dashboardService={this.props.dashboardService}
                            deleteDataset={(id) => this.deleteDataset(id)}
                            getDataset={(id) => this.getDataset(id)}
                            loading={query.loading}
                            deleting={query.deleting}
        />
      )
    })
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
    const {
      header
    } = this.props
    return (
      <Accordion header={header}
                 className="mx-0 mt-4"
                 openByDefault
      >
        {this.renderTable()}
      </Accordion>
    )
  }

  render() {
    return (
      <section className="xp-part part-dashboard">
        <Row>
          <Col>
            <div className="p-4 tables-wrapper">
              <h2 className="mb-3">
                {`Spørringer mot statistikkbank og tabellbygger (${this.state.dataQueries ? this.state.dataQueries.length : '0'} stk)`}
              </h2>
              {this.renderAccordians()}
            </div>
          </Col>
        </Row>
      </section>
    )
  }

}


Dashboard.propTypes = {
  header: PropTypes.string,
  dashboardService: PropTypes.string,
  dataQueries: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      displayName: PropTypes.string,
      class: PropTypes.string,
      updated: PropTypes.string,
      updatedHumanReadable: PropTypes.string,
      hasData: PropTypes.boolean,
      showSuccess: PropTypes.boolean,
      showError: PropTypes.boolean,
      successMessage: PropTypes.string,
      errorMessage: PropTypes.string
    })
  )
}

export default (props) => <Dashboard {...props} />
