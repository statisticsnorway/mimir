import React, { useMemo } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { ReactTable } from '../../components/ReactTable'
import { selectJobs, selectLoading } from './selectors'

export function Jobs() {
  const loading = useSelector(selectLoading)
  const jobs = useSelector(selectJobs)
  const columns = useMemo(() => [
    {
      Header: 'Tidspunkt',
      accessor: 'ts',
      sortType: () => {
        return 1
      }
    },
    {
      Header: 'Jobbnavn',
      accessor: 'name',
      disableSortBy: true
    },
    {
      Header: 'Info',
      accessor: 'info',
      disableSortBy: true
    }
  ])

  function getJobRows() {
    return jobs
  }
  const tableRows = React.useMemo(() => getJobRows(), [])

  function renderSpinner() {
    return (
      <span className="spinner-border spinner-border" />
    )
  }

  function renderTable() {
    return (
      <ReactTable columns={columns} data={tableRows} />
    )
  }

  return (
    <div className="p-4 tables-wrapper">
      <h2>Jobblogg</h2>
      <Container>
        <Row className="mb-3">
          <Col>
            {loading ? renderSpinner() : renderTable()}
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default (props) => <Jobs {...props} />
