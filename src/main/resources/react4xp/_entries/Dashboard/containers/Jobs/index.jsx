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
      sortType: (a, b) => {
        return a.original.tsSort > b.original.tsSort ? 1 : -1
      }
    },
    {
      Header: 'Jobbnavn',
      accessor: 'name',
      sortType: (a, b) => {
        if (a.original.nameSort === b.original.nameSort) {
          return a.original.tsSort > b.original.tsSort ? 1 : -1
        }
        return a.original.nameSort > b.original.nameSort ? 1 : -1
      }
    },
    {
      Header: 'Info',
      accessor: 'info',
      disableSortBy: true
    }
  ])

  function getJobRows() {
    return jobs.map((job) => {
      const ts = job.completionTime ? job.completionTime : job.startTime
      const name = job.task
      const info = `${job.status} - ${job.message}`
      return {
        ts,
        tsSort: new Date(ts),
        name,
        nameSort: name.toLowerCase(),
        info
      }
    })
  }
  const tableRows = React.useMemo(() => getJobRows(), [jobs])

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
      <Container className="job-log-container">
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