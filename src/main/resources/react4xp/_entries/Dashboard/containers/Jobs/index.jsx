import React, { useMemo, useState } from 'react'
import { Col, Container, Row, Modal, Button } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { ReactTable } from '../../components/ReactTable'
import { selectJobs, selectLoading } from './selectors'
import { selectContentStudioBaseUrl } from '../HomePage/selectors'
import { Link, Accordion } from '@statisticsnorway/ssb-component-library'
import { DataQueryBadges } from '../../components/DataQueryBadges'
import moment from 'moment/min/moment-with-locales'

export function Jobs() {
  const loading = useSelector(selectLoading)
  const jobs = useSelector(selectJobs)
  const contentStudioBaseUrl = useSelector(selectContentStudioBaseUrl)
  const [currentModalJob, setCurrentModalJob] = useState(null)
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
      const ts = moment(job.completionTime ? job.completionTime : job.startTime).locale('nb').format('DD.MM.YYYY HH.mm.ss')
      const name = getTranslatedJobName(job.task)

      const info = renderInfo(job)
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

  function getTranslatedJobName(task) {
    switch (task) {
    case '-- Running dataquery cron job --':
      return 'Kjøre oppdaterte spørringer'
    case 'Delete expired eventlogs':
      return 'Slette eventlog'
    case 'Publish statistics':
      return 'Publisering statistikk'
    case 'Refresh statreg data':
      return 'Import Statreg'
    default:
      return task
    }
  }

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

  function openJobLogModal(job) {
    setCurrentModalJob(job)
  }

  function closeJobLogModal() {
    setCurrentModalJob(null)
  }

  function renderInfo(job) {
    if (job.task === 'Publish statistics') {
      return (
        <span className="modal-trigger" onClick={() => openJobLogModal(job)}>
          {job.status} - {job.message}
        </span>
      )
    } else if (job.task === 'Refresh statreg data') {
      return (
        <React.Fragment>
          {job.status}<br/>
          {job.result.map((res, index) => {
            const {
              status,
              displayName,
              infoMessage,
              showWarningIcon
            } = res
            return (
              <React.Fragment key={index}>
                {displayName} - {showWarningIcon ? <span className="error">{status}</span> : status}{infoMessage ? ` : ${infoMessage}` : ''} <br/>
              </React.Fragment>
            )
          })}
        </React.Fragment>
      )
    }
    return <span>{job.status} - {job.message}</span>
  }

  const ModalContent = () => {
    return (
      <Modal
        show={true}
        onHide={() => closeJobLogModal()}
        animation={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Logg detaljer
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {renderJobLogs()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => closeJobLogModal()}>Lukk</Button>
        </Modal.Footer>
      </Modal>
    )
  }

  function renderJobLogs() {
    return currentModalJob.result.map((statisticResult, index) => {
      return (
        <Accordion
          key={index}
          header={statisticResult.shortName}
          subHeader={statisticResult.status}>
          {statisticResult.dataSources.map((dataSource, index) => {
            return (
              <p key={index}>
                {dataSource.status} -&nbsp;
                <span className="small">
                  <DataQueryBadges contentType={dataSource.type} format={dataSource.datasetType} isPublished={true} floatRight={false} />
                </span>
                <br />
                <Link isExternal href={contentStudioBaseUrl + dataSource.id}>{dataSource.displayName}</Link> - {dataSource.datasetKey}
              </p>
            )
          })}
        </Accordion>
      )
    })
  }

  return (
    <div className="p-4 tables-wrapper">
      <h2>Jobblogg</h2>
      <Container className="job-log-container">
        <Row className="mb-3">
          <Col>
            {loading ? renderSpinner() : renderTable()}
            {currentModalJob ? <ModalContent/> : null}
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default (props) => <Jobs {...props} />
