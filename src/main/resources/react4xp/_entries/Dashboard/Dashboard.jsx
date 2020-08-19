import React from 'react'
import { Accordion } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import Alert from 'react-bootstrap/Alert'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Table from 'react-bootstrap/Table'
import DashboardDataQuery from './DashboardDataQuery'
import DashboardButtons from './DashboardButtons'
import ClearCacheButton from './ClearCacheButton'
import StatRegDashboard from './StatRegDashboard'
import axios from 'axios'
import { groupBy } from 'ramda'
import { StatRegFetchInfo } from './types'
import DataQueryTable from './DataQueryTable'

const byType = groupBy((dataQuery) => {
  return dataQuery.parentType
})

class Dashboard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataQueries: props.dataQueries,
      errorMsg: '',
      successMsg: '',
      showErrorAlert: false,
      showSuccessAlert: false
    }

    this.renderDataQueries = this.renderDataQueries.bind(this)
  }

  showSuccess(msg) {
    this.setState({
      successMsg: msg,
      showSuccessAlert: true
    })
  }

  showError(msg) {
    this.setState({
      errorMsg: msg,
      showErrorAlert: true
    })
  }

  getRequest(id) {
    return axios.get(this.props.dashboardService, {
      params: {
        id: id
      }
    })
  }

  deleteRequest(id) {
    return axios.delete(this.props.dashboardService, {
      params: {
        id: id
      }
    })
  }

  setLoading(id, value) {
    this.setState({
      dataQueries: this.state.dataQueries.map((query) => {
        if (query.id === id) {
          return {
            ...query,
            loading: value
          }
        }
        return query
      })
    })
  }

  refreshRow(updatedDataQueries) {
    const updatedSet = this.state.dataQueries.map((dataQuery) => {
      const updated = updatedDataQueries.filter( (updatedQuery) => updatedQuery.id === dataQuery.id)
        .map((updatedQuery) => {
          return {
            ...dataQuery,
            ...updatedQuery,
            dataset: {
              modifiedReadable: updatedQuery.dataset.newDatasetData ? updatedQuery.dataset.modifiedReadable :
                dataQuery.dataset.modifiedReadable,
              modified: updatedQuery.dataset.newDatasetData ? updatedQuery.dataset.modified :
                dataQuery.dataset.modified
            }
          }
        })
      if (updated.length > 0) {
        return updated[0]
      } else {
        return dataQuery
      }
    })
    this.setState({
      dataQueries: updatedSet
    })
  }

  renderDataQueries(queries) {
    return queries.map( (dataquery) => {
      return (
        <DashboardDataQuery key={dataquery.id}
          id={dataquery.id}
          dataquery={dataquery}
          showSuccess={(msg) => this.showSuccess(msg)}
          showError={(msg) => this.showError(msg)}
          getRequest={(id) => this.getRequest(id)}
          deleteRequest={(id) => this.deleteRequest(id)}
          refreshRow={(id) => this.refreshRow(id)}
          setLoading={(id, value) => this.setLoading(id, value)}
          contentStudioBaseUrl={this.props.contentStudioBaseUrl}
          eventLogNodes={dataquery.logData && dataquery.logData.eventLogNodes ? dataquery.logData.eventLogNodes : undefined }
        />
      )
    })
  }

  renderTable(queries) {
    return (
      <DataQueryTable queries={queries} renderDataQueries={this.renderDataQueries} />
    )
  }

  renderAccordians(header, queries) {
    return (
      <Accordion header={header}
        className="mx-0"
      >
        { this.props.featureToggling.updateList &&
          <DashboardButtons
            dataQueries={queries}
            refreshRow={(queries) => this.refreshRow(queries)}
            getRequest={(id) => this.getRequest(id)}
            setLoading={(id, value ) => this.setLoading(id, value)}
          />
        }
        {this.renderTable(queries)}
      </Accordion>
    )
  }

  renderAccordionForStatRegFetches () {
    console.log('Accordion StatReg statuses', this.props.statRegFetchStatuses)
    return (
      <Accordion header="Status" className="mx-0" openByDefault={true}>
        <StatRegDashboard currStatus={this.props.statRegFetchStatuses} />
      </Accordion>
    )
  }

  render() {
    const groupedQueries = byType(this.state.dataQueries)
    return (
      <section className="xp-part part-dashboard container">
        <Row>
          <Col>
            <div className="p-4 tables-wrapper">
              <h2 className="mb-3">
                {`Spørringer mot statistikkbank og tabellbygger (${this.state.dataQueries ? this.state.dataQueries.length : '0'} stk)`}
              </h2>
              {
                groupedQueries.factPage &&
                this.renderAccordians(`Spørringer fra Faktasider (${groupedQueries.factPage.length})`, groupedQueries.factPage)
              }

              {
                groupedQueries.municipality &&
                this.renderAccordians(`Spørringer fra Kommunefakta (${groupedQueries.municipality.length})`, groupedQueries.municipality)
              }

              {
                groupedQueries.default &&
                this.renderAccordians(`Andre (${groupedQueries.default.length})`, groupedQueries.default)
              }
            </div>
          </Col>
        </Row>

        <section className="xp-part part-dashboard container">
          <Row>
            <Col>
              <div className="p-4 tables-wrapper">
                <h2>Data fra Statistikkregisteret</h2>
                {this.renderAccordionForStatRegFetches()}
              </div>
            </Col>
          </Row>
        </section>

        <Row className="my-3">
          <Col className="p-4">
            <ClearCacheButton
              onSuccess={(message) => this.showSuccess(message)}
              onError={(message) => this.showError(message)}
              clearCacheServiceUrl={this.props.clearCacheServiceUrl}
            />
          </Col>
        </Row>

        <Alert variant="danger"
          show={this.state.showErrorAlert}
          onClose={() => this.setState({
            showErrorAlert: false
          })}
          dismissible
          role="alert">
          <p>{this.state.errorMsg}</p>
        </Alert>

        <Alert variant="success"
          show={this.state.showSuccessAlert}
          onClose={() => this.setState({
            showSuccessAlert: false
          })}
          dismissible
          role="alert">
          <p>{this.state.successMsg}</p>
        </Alert>
      </section>
    )
  }
}


Dashboard.propTypes = {
  header: PropTypes.string,
  dashboardService: PropTypes.string,
  clearCacheServiceUrl: PropTypes.string,
  dataQueries: PropTypes.arrayOf(
    PropTypes.shape(DataQuery)
  ),
  groupedQueries: PropTypes.shape({
    default: PropTypes.arrayOf(PropTypes.shape(DataQuery)),
    factPage: PropTypes.arrayOf(PropTypes.shape(DataQuery)),
    municipality: PropTypes.arrayOf(PropTypes.shape(DataQuery))
  }),
  featureToggling: PropTypes.shape({
    updateList: PropTypes.bool
  }),
  contentStudioBaseUrl: PropTypes.string,
  statRegFetchStatuses: PropTypes.arrayOf(StatRegFetchInfo)
}

export const DataQuery = PropTypes.shape({
  id: PropTypes.string,
  displayName: PropTypes.string,
  path: PropTypes.string,
  parentType: PropTypes.string,
  format: PropTypes.string,
  isPublished: PropTypes.bool,
  hasData: PropTypes.bool,
  loading: PropTypes.bool,
  deleting: PropTypes.bool,
  dataset: PropTypes.shape({
    modified: PropTypes.instanceOf(Date),
    modifiedReadable: PropTypes.string
  }),
  logData: PropTypes.shape({
    queryId: PropTypes.string,
    modifiedReadable: PropTypes.string,
    modifiedResult: PropTypes.string,
    modified: PropTypes.string,
    modifiedTs: PropTypes.string,
    message: PropTypes.string,
    by: PropTypes.shape({
      login: PropTypes.string,
      displayName: PropTypes.string
    }),
    eventLogNodes: PropTypes.arrayOf(PropTypes.shape({
      message: PropTypes.string,
      modifiedTs: PropTypes.string
    }))
  })
})

export default (props) => <Dashboard {...props} />
