import React, { useReducer } from 'react'
import PropTypes from 'prop-types'
import { Button, Table } from 'react-bootstrap'
import { StatRegFetchInfo } from './types'
import { RefreshCw } from 'react-feather'
import moment from 'moment'

const statusIcon = (item) =>
  item.status === 'Success' ? 'ok' : 'error'

const SIMPLE_DATE_FORMAT = 'DD.MM.YYYY HH:mm'
const formatDate = (dateStr) =>
  moment(dateStr).format(SIMPLE_DATE_FORMAT)

const makeRefreshButton = (onClick) => (
  <Button
    variant="primary"
    size="sm"
    className="mx-1"
    onClick={onClick}
  >
    <RefreshCw size={16} />
  </Button>
)

const StatRegDashboard = (props) => {
  const { contacts, statistics, publications } = props.currStatus
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
          <td className={`${statusIcon(contacts)} dataset`}>
            <a className="ssb-link" href="#">Kontakter</a>
          </td>
          <td>{formatDate(contacts.completionTime)}</td>
          <td>{contacts.message}</td>
          <td>{makeRefreshButton(() => {})}</td>
        </tr>
        <tr>
          <td className={`${statusIcon(statistics)} dataset`}>
            <a className="ssb-link" href="#">Statistikk</a>
          </td>
          <td>{formatDate(statistics.completionTime)}</td>
          <td>{statistics.message}</td>
          <td>{makeRefreshButton(() => {})}</td>
        </tr>
        <tr>
          <td className={`${statusIcon(publications)} dataset`}>
            <a className="ssb-link" href="#">Publiseringer</a>
          </td>
          <td>{formatDate(publications.completionTime)}</td>
          <td>{publications.message}</td>
          <td>
            {makeRefreshButton(() => {})}
          </td>
        </tr>
      </tbody>
    </Table>
  )
}

StatRegDashboard.propTypes = {
  currStatus: PropTypes.shape({
    contacts: StatRegFetchInfo,
    statistics: StatRegFetchInfo,
    publications: StatRegFetchInfo
  })
}

export default StatRegDashboard
