import React from 'react'
import { Accordion } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import Alert from 'react-bootstrap/Alert'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import DashboardDataQuery from './DashboardDataQuery'
import DashboardButtons from './DashboardButtons'
import ClearCacheButton from './ClearCacheButton'
import Convert from './Convert'
import StatRegDashboard, { StatRegFetchInfo } from './StatRegDashboard'
import Axios from 'axios'
import { groupBy } from 'ramda'
import DataQueryTable from './DataQueryTable'
import { Zap, ZapOff } from 'react-feather'
import Badge from 'react-bootstrap/Badge'
import { Container } from 'react-bootstrap'


const byParentType = groupBy((dataQuery) => {
  if (dataQuery.logData && dataQuery.logData.showWarningIcon) {
    return 'error'
  }
  return dataQuery.parentType
})

class Dashboard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataQueries: props.dataQueries,
      statRegData: props.statRegFetchStatuses,
      errorMsg: '',
      successMsg: '',
      showErrorAlert: false,
      showSuccessAlert: false,
      wsConnection: new ExpWS(),
      io: null,
      isConnected: false
    }

    this.renderDataQueries = this.renderDataQueries.bind(this)
  }

  onConnectionClose(event) {
    this.setState({
      isConnected: false
    })
  }

  onConnectionOpen(event) {
    this.setState({
      isConnected: true
    })
    this.state.io.emit('dashboard-register-user', {
      user: this.props.userLogin
    })
  }

  componentDidMount() {
    const {
      wsConnection
    } = this.state

    // listen to open and close ws connection, so we can tell the user they have disconnected
    wsConnection.setEventHandler('close', (event) => {
      this.onConnectionClose(event)
    })

    wsConnection.setEventHandler('open', (event) => {
      this.onConnectionOpen(event)
    })

    this.setState({
      io: new wsConnection.Io()
    })

    // keep-alive for socket (or it will timeout and stop working after 5 minutes)
    setInterval(() => {
      this.state.io.emit('keep-alive', 'ping')
    }, 1000 * 60 * 3)
  }

  componentDidUpdate() {
    if (this.state.io) {
      this.setupWSListener()
    }
  }

  setupWSListener() {
    this.state.io.on(`dashboard-activity-refreshDataset`, (dataset) => this.setLoading(dataset.id, true))
    this.state.io.on(`dashboard-activity-refreshDataset-result`, (datasetInfo) => this.updateDatasetInfo(datasetInfo))
  }

  updateDatasetInfo(datasetInfo) {
    this.setState({
      dataQueries: this.state.dataQueries.map((query) => {
        if (query.id === datasetInfo.id) {
          return {
            ...query,
            logData: datasetInfo.logData
          }
        }
        return query
      })
    })
    this.setLoading(datasetInfo.id, false)
  }

  renderBadge() {
    if (this.state.isConnected) {
      return (<Badge variant="success"><span>Connected<Zap></Zap></span></Badge>)
    } else {
      return (<Badge variant="danger"><span>Disconnected<ZapOff></ZapOff></span></Badge>)
    }
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
    return Axios.get(this.props.dashboardService, {
      params: {
        id: id
      }
    })
  }

  deleteRequest(id) {
    return Axios.delete(this.props.dashboardService, {
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
      const fromStateQuery = this.state.dataQueries.find( (dq) => dq.id === dataquery.id)
      return (
        <DashboardDataQuery key={fromStateQuery.id}
          id={fromStateQuery.id}
          dataquery={fromStateQuery}
          showSuccess={(msg) => this.showSuccess(msg)}
          showError={(msg) => this.showError(msg)}
          getRequest={(id) => this.getRequest(id)}
          deleteRequest={(id) => this.deleteRequest(id)}
          refreshRow={(id) => this.refreshRow(id)}
          setLoading={(id, value) => this.setLoading(id, value)}
          contentStudioBaseUrl={this.props.contentStudioBaseUrl}
          eventLogNodes={fromStateQuery.logData && fromStateQuery.logData.eventLogNodes ? fromStateQuery.logData.eventLogNodes : undefined }
          io={this.state.io}
        />
      )
    })
  }

  renderTable(queries) {
    return (
      <DataQueryTable queries={queries} renderDataQueries={this.renderDataQueries} />
    )
  }

  renderAccordians(header, queries, openByDefault = false) {
    return (
      <Accordion header={header}
        className="mx-0"
        openByDefault={openByDefault}
      >
        { this.props.featureToggling.updateList &&
          <DashboardButtons
            className="mb-3"
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

  render() {
    const groupedQueries = byParentType(this.state.dataQueries)
    const tableQueries = this.state.dataQueries.filter((q) => q.type === 'mimir:table')
    return (
      <Container>
        {this.renderBadge()}
        <Tabs defaultActiveKey="queries">
          <Tab eventKey="queries" title="Spørringer">
            <section className="xp-part part-dashboard container">
              <Row>
                <Col>
                  <div className="p-4 tables-wrapper">
                    <h2 className="mb-3">
                      {`Spørringer mot statistikkbank og tabellbygger (${this.state.dataQueries ? this.state.dataQueries.length : '0'} stk)`}
                    </h2>
                    {
                      groupedQueries.error &&
                    this.renderAccordians(`Spørringer som feilet (${groupedQueries.error.length})`, groupedQueries.error, true)
                    }

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

              <StatRegDashboard
                onError={() => this.showError}
                onSuccess={() => this.showSuccess}
                refreshStatregDataUrl={this.props.refreshStatregDataUrl}
                currStatus={this.props.statRegFetchStatuses}
                io={this.state.io}
              />

              <Row className="my-3">
                <Col className="p-4 tables-wrapper">
                  <ClearCacheButton
                    onSuccess={(message) => this.showSuccess(message)}
                    onError={(message) => this.showError(message)}
                    clearCacheServiceUrl={this.props.clearCacheServiceUrl}
                  />
                  { this.props.featureToggling.updateList &&
                    <DashboardButtons
                      className="d-inline mx-3"
                      dataQueries={tableQueries}
                      refreshRow={(tableQueries) => this.refreshRow(tableQueries)}
                      getRequest={(id) => this.getRequest(id)}
                      setLoading={(id, value ) => this.setLoading(id, value)}
                      buttonText={`Oppdater alle tabeller (${tableQueries.length})`}
                    />
                  }
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

          </Tab>
          <Tab eventKey="other" title="Annet">
            <section className="xp-part part-dashboard container">
              <Row>
                <Col>
                  <div className="p-4 tables-wrapper">
                    <h2 className="mb-3">
                      {`Konvertering`}
                    </h2>
                    <Convert io={this.state.io} convertServiceUrl={this.props.convertServiceUrl}></Convert>
                  </div>
                </Col>
              </Row>
            </section>
          </Tab>
        </Tabs>
      </Container>
    )
  }
}


Dashboard.propTypes = {
  header: PropTypes.string,
  dashboardService: PropTypes.string,
  clearCacheServiceUrl: PropTypes.string,
  refreshStatregDataUrl: PropTypes.string,
  convertServiceUrl: PropTypes.string,
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
  statRegFetchStatuses: PropTypes.shape({
    contacts: StatRegFetchInfo,
    statistics: StatRegFetchInfo,
    publications: StatRegFetchInfo
  }),
  userLogin: PropTypes.string
}

export const DataQuery = PropTypes.shape({
  id: PropTypes.string,
  displayName: PropTypes.string,
  path: PropTypes.string,
  parentType: PropTypes.string,
  type: PropTypes.string,
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
