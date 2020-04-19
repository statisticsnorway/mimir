import React from 'react'
import { Accordion, Button } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Table from 'react-bootstrap/Table'
import DashboardDataQuery from './DashboardDataQuery'
import axios from 'axios'

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
      if (response.data.success) {
        this.updateDataQueries(response.data.updates)
        this.showSuccess(response.data.message)
      } else {
        this.showError(response.data.message)
      }
    })
      .catch((e) => {
        this.showError(e.response.data.message)
      })
      .finally(() => {
        if(id !== '*') {
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
        .map((updatedQuery) => ({
          ...dataQuery,
          ...updatedQuery,
          loading: false,
          deleting: false
        }))
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
        {this.renderFooter()}
      </section>
    )
  }



  renderDeleteAllButtonAndDialog() {
    return (
        <Button className="js-dashboard-delete pb-2" >
          Slett alle dataset
        </Button>
    )
  }
  /*renderDownloadAllButtonAndDialog() {
    return (
      <>
        <SSBButton
          primary
          className="ml-2 js-dashboard-update pb-2"
          onClick={() => this.setState({
            showDownloadAllDialog: true
          })}>
          {this.state.downloadingAll ?  <span className="spinner-border spinner-border-sm mr-2"></span>: ''}
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
  }*/

  renderFooter() {
    return (
      <nav className="footerNavigation my-4">
        {this.renderDeleteAllButtonAndDialog()}

      </nav>
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
