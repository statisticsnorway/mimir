import React from 'react'
import { Accordion, Button as SSBButton } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import Alert from 'react-bootstrap/Alert'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import Table from 'react-bootstrap/Table'
import DashboardDataQuery from './DashboardDataQuery'
import axios from 'axios'
import { groupBy } from 'ramda'

const byType = groupBy((dataQuery) => {
  return dataQuery.parentType
})

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

  deleteDataset(dataQueryId) {
    this.setState({
      dataQueries: this.state.dataQueries.map( (query) => {
        if (query.id === dataQueryId) {
          query.deleting = true
        }
        return query
      })
    })
    this.deleteRequest(dataQueryId)
  }

  getDataset(dataQueryId) {
    this.setState({
      dataQueries: this.state.dataQueries.map( (query) => {
        if (query.id === dataQueryId) {
          query.loading = true
        }
        return query
      })
    })
    this.getRequest(dataQueryId)
  }

  stopLoadingIndicators(dataQueryId) {
    this.setState({
      dataQueries: this.state.dataQueries.map( (query) => {
        if (query.id === dataQueryId) {
          query.loading = false,
          query.deleting = false
        }
        return query
      })
    })
  }

  handleHideDeleteAllDialog(deleteIsPushed) {
    if (deleteIsPushed) {
      this.setState({
        deletingAll: true
      })
      this.deleteRequest('*')
    }
    this.setState({
      showDeleteAllDialog: false
    })
  }

  handleHideDownloadAllDialog(downloadIsPushed) {
    if (downloadIsPushed) {
      this.setState({
        downloadingAll: true
      })
      this.getRequest('*')
    }
    this.setState({
      showDownloadAllDialog: false
    })
  }

  getRequest(id) {
    const request = axios.get(this.props.dashboardService, {
      params: {
        id: id
      }
    })
    return this.resultHandler(request, id)
  }

  deleteRequest(id) {
    const request = axios.delete(this.props.dashboardService, {
      params: {
        id: id
      }
    })
    return this.resultHandler(request, id)
  }

  resultHandler(p, id) {
    return p.then((response) => {

      if (response.data.status === 200) {
        this.updateDataQueries(response.data.updates)
        this.showSuccess(response.data.message)
      } else {
        this.showError(response.data.message)
      }
    })
      .catch((e) => {
        this.updateDataQueries(e.response.data.updates)
        this.showError(e.response.data.message)
      })
      .finally(() => {
        if (id !== '*') {
          this.stopLoadingIndicators(id)
        } else {
          this.setState({
            downloadingAll: false,
            deletingAll: false
          })
        }
      })
  }

  updateDataQueries(updatedDataQueries) {
    const updatedSet = this.state.dataQueries.map((dataQuery) => {
      const updated = updatedDataQueries.filter( (updatedQuery) => updatedQuery.id === dataQuery.id)
        .map((updatedQuery) => {
          return {
            ...dataQuery,
            logData: {
              lastUpdateResult: updatedQuery.updateMessage,
              lastUpdated: updatedQuery.lastUpdated,
              lastUpdatedHumanReadable: updatedQuery.updatedHumanReadable
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
    return queries.map( (query) => {
      return (
        <DashboardDataQuery key={query.id}
          id={query.id}
          displayName={query.displayName}
          format={query.format}
          isPublished={query.isPublished? query.isPublished : undefined}
          updated={query.updated}
          updatedHumanReadable={query.updatedHumanReadable}
          hasData={query.hasData}
          dashboardService={this.props.dashboardService}
          deleteDataset={(id) => this.deleteDataset(id)}
          getDataset={(id) => this.getDataset(id)}
          loading={query.loading}
          deleting={query.deleting}
          lastUpdated={query.logData && query.logData.lastUpdated ? query.logData.lastUpdated : undefined}
          lastUpdatedHumanReadable={query.logData && query.logData.lastUpdatedHumanReadable ? query.logData.lastUpdatedHumanReadable : undefined}
          lastUpdateResult={query.logData && query.logData.lastUpdateResult ? query.logData.lastUpdateResult : undefined}
        />
      )
    })
  }

  renderTable(queries) {
    return (
      <Table bordered striped>
        <thead>
          <tr>
            <th className="roboto-bold">Spørring</th>
            <th className="roboto-bold">Sist oppdatert</th>
            <th className="roboto-bold">Siste spørring</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {this.renderDataQueries(queries)}
        </tbody>
      </Table>
    )
  }

  renderAccordians(header, queries) {
    return (
      <Accordion header={header}
        className="mx-0"
        openByDefault
      >
        {this.renderTable(queries)}
      </Accordion>
    )
  }

  render() {
    const groupedQueries = byType(this.state.dataQueries)
    return (
      <section className="xp-part part-dashboard">
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
        {this.renderFooter()}
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

  renderDialogBox(data) {
    return (
      <Modal show={this.state[data.stateProperty]} onHide={() => data.onHide(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{data.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{data.body}</Modal.Body>
        <Modal.Footer>
          <SSBButton secondary onClick={() => data.onHide(false)}>
            {data.cancelTitle}
          </SSBButton>
          <SSBButton primary onClick={() => data.onHide(true)}>
            {data.submitTitle}
          </SSBButton>
        </Modal.Footer>
      </Modal>
    )
  }

  renderDeleteAllButtonAndDialog() {
    return (
      <>
        <SSBButton
          secondary
          className="js-dashboard-delete pb-2"
          onClick={() => this.setState({
            showDeleteAllDialog: true
          })}>
          {this.state.deletingAll ? <span className="spinner-border spinner-border-sm mr-2"></span> : ''}
          Slett alle dataset
        </SSBButton>
        {this.renderDialogBox({
          stateProperty: 'showDeleteAllDialog',
          onHide: (status) => this.handleHideDeleteAllDialog(status),
          title: 'Vil du slette alle dataset?',
          body: 'Alle dataset vil bli slettet',
          cancelTitle: 'Avbryt',
          submitTitle: 'Slett'
        })}
      </>
    )
  }
  renderDownloadAllButtonAndDialog() {
    return (
      <>
        <SSBButton
          primary
          className="ml-2 js-dashboard-update pb-2"
          onClick={() => this.setState({
            showDownloadAllDialog: true
          })}>
          {this.state.downloadingAll ? <span className="spinner-border spinner-border-sm mr-2"></span> : ''}
          Oppdater alle dataset
        </SSBButton>
        {this.renderDialogBox({
          stateProperty: 'showDownloadAllDialog',
          onHide: (status) => this.handleHideDownloadAllDialog(status),
          title: 'Vil du laste ned alle datasettene på nytt?',
          body: 'Alle datasett vil bli lastet ned på nytt.',
          cancelTitle: 'Lukk',
          submitTitle: 'Last ned'
        })}
      </>
    )
  }

  renderFooter() {
    return (
      <nav className="footerNavigation my-4">
        {this.renderDeleteAllButtonAndDialog()}
        {this.renderDownloadAllButtonAndDialog()}

      </nav>
    )
  }
}


Dashboard.propTypes = {
  header: PropTypes.string,
  dashboardService: PropTypes.string,
  dataQueries: PropTypes.arrayOf(
    PropTypes.shape(dataqueryShape)
  ),
  groupedQueries: PropTypes.shape({
    default: PropTypes.arrayOf(PropTypes.shape(dataqueryShape)),
    factPage: PropTypes.arrayOf(PropTypes.shape(dataqueryShape)),
    municipality: PropTypes.arrayOf(PropTypes.shape(dataqueryShape))
  })
}

const dataqueryShape = PropTypes.shape({
  id: PropTypes.string,
  displayName: PropTypes.string,
  path: PropTypes.string,
  parentType: PropTypes.string,
  format: PropTypes.string,
  updated: PropTypes.string,
  updatedHumanReadable: PropTypes.string,
  hasData: PropTypes.boolean,
  showSuccess: PropTypes.boolean,
  showError: PropTypes.boolean,
  successMessage: PropTypes.string,
  errorMessage: PropTypes.string,
  logData: {
    lastUpdateResult: PropTypes.string
  }
})

export default (props) => <Dashboard {...props} />
