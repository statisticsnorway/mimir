import React from 'react'
import PropTypes from 'prop-types'
import { Button, Table, Row, Col } from 'react-bootstrap'
import { RefreshCw } from 'react-feather'
import moment from 'moment'
import RefreshDataButton from './RefreshDataButton'
import { Accordion } from '@statisticsnorway/ssb-component-library'

const SIMPLE_DATE_FORMAT = 'DD.MM.YYYY HH:mm'

class StatRegDashboard extends React.Component {
  statusIcon(item) {
    return item.status === 'Success' ? 'ok' : 'error'
  }

  formatDate(dateStr) {
    return moment(dateStr).format(SIMPLE_DATE_FORMAT)
  }

  refreshStatReg(key) {
    // NOTE add socket stuff
  }

  makeRefreshButton(key) {
    return (
      <Button
        variant="primary"
        size="sm"
        className="mx-1"
        onClick={() => this.refreshStatReg(key)}
      >
        <RefreshCw size={16} />
      </Button>
    )
  }

  renderTable() {
    const {
      contacts, statistics, publications
    } = this.props.currStatus
    return (
      <Table bordered striped>
        <thead>
          <tr>
            <th className="roboto-bold">Spørring</th>
            <th className="roboto-bold">Sist oppdatert</th>
            <th className="roboto-bold">Siste aktivitet</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={`${this.statusIcon(contacts)} dataset`}>
              <a className="ssb-link" href="#">Kontakter</a>
            </td>
            <td>{this.formatDate(contacts.completionTime)}</td>
            <td>{contacts.message}</td>
            <td style={{
              textAlign: 'center'
            }}>{this.makeRefreshButton('contacts')}</td>
          </tr>
          <tr>
            <td className={`${this.statusIcon(statistics)} dataset`}>
              <a className="ssb-link" href="#">Statistikk</a>
            </td>
            <td>{this.formatDate(statistics.completionTime)}</td>
            <td>{statistics.message}</td>
            <td style={{
              textAlign: 'center'
            }}>{this.makeRefreshButton('statistics')}</td>
          </tr>
          <tr>
            <td className={`${this.statusIcon(publications)} dataset`}>
              <a className="ssb-link" href="#">Publiseringer</a>
            </td>
            <td>{this.formatDate(publications.completionTime)}</td>
            <td>{publications.message}</td>
            <td style={{
              textAlign: 'center'
            }}>
              {this.makeRefreshButton('publications')}
            </td>
          </tr>
        </tbody>
      </Table>
    )
  }

  render() {
    return (
      <section className="xp-part part-dashboard container my-5">
        <Row>
          <Col>
            <div className="p-4 tables-wrapper">
              <h2 className="d-inline-block w-75">Data fra Statistikkregisteret</h2>
              <div className="d-inline-block float-right">
                <RefreshDataButton
                  onSuccess={(message) => this.props.onSuccess('Statreg data er oppdatert')}
                  onError={(message) => this.props.onError(message)}
                  statregDashboardServiceUrl={this.props.refreshStatregDataUrl}
                />
              </div>
              <Accordion header="Status" className="mx-0" openByDefault={true}>
                {this.renderTable()}
              </Accordion>
            </div>
          </Col>
        </Row>
      </section>
    )
  }
}

StatRegDashboard.propTypes = {
  refreshStatregDataUrl: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  currStatus: PropTypes.shape({
    contacts: StatRegFetchInfo,
    statistics: StatRegFetchInfo,
    publications: StatRegFetchInfo
  })
}

export const StatRegFetchInfo = PropTypes.shape({
  status: PropTypes.string,
  message: PropTypes.string,
  startTime: PropTypes.string,
  completionTime: PropTypes.string
})

export default (props) => <StatRegDashboard {...props} />
