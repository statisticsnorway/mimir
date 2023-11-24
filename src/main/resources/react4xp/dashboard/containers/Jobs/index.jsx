import React, { useMemo, useState } from 'react'
import { Col, Container, Row, Modal } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { AlertTriangle } from 'react-feather'
import { ReactTable } from '/react4xp/dashboard/components/ReactTable'
import { selectJobs, selectLoading } from '/react4xp/dashboard/containers/Jobs/selectors'
import { selectContentStudioBaseUrl } from '/react4xp/dashboard/containers/HomePage/selectors'
import { Link, Accordion, Divider, Button } from '@statisticsnorway/ssb-component-library'
import { DataQueryBadges } from '/react4xp/dashboard/components/DataQueryBadges'
import { default as format } from 'date-fns/format'

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
      },
    },
    {
      Header: 'Jobbnavn',
      accessor: 'name',
      sortType: (a, b) => {
        if (a.original.nameSort === b.original.nameSort) {
          return a.original.tsSort > b.original.tsSort ? 1 : -1
        }
        return a.original.nameSort > b.original.nameSort ? 1 : -1
      },
    },
    {
      Header: 'Info',
      accessor: 'info',
      disableSortBy: true,
    },
  ])

  function getJobRows() {
    return jobs.map((job) => {
      const jobTime = job.completionTime ? job.completionTime : job.startTime
      const ts = jobTime ? format(new Date(jobTime), 'dd.MM.yyyy HH:mm') : null
      const name = getTranslatedJobName(job.task)
      const hasError =
        !!job.result?.result?.some((ds) => ds.hasError) || (job.status != 'COMPLETE' && job.status != 'STARTED')

      const info = renderInfo(job)
      return {
        ts,
        tsSort: new Date(ts),
        name,
        nameSort: name ? name.toLowerCase() : job.task,
        info,
        hasError,
      }
    })
  }
  const tableRows = React.useMemo(() => getJobRows(), [jobs])

  function getTranslatedJobName(task) {
    switch (task) {
      case '-- Running dataquery cron job --':
        return 'Kjøre oppdaterte spørringer'
      case 'Refresh dataset':
        return 'Kjøre oppdaterte spørringer'
      case 'Refresh dataset calculators':
        return 'Oppdatere kalkulatorer'
      case 'Delete expired event logs for queries':
        return 'Slette utdaterte event logs for spørringer'
      case 'Publish statistics':
        return 'Publisering statistikk'
      case 'Refresh statreg data':
        return 'Import Statreg'
      case 'Refresh dataset for SDDS tables':
        return 'Oppdatere SDDS tabeller'
      default:
        return task
    }
  }

  function renderSpinner() {
    return <span className='spinner-border spinner-border' />
  }

  function renderTable() {
    return <ReactTable columns={columns} data={tableRows} />
  }

  function openJobLogModal(job) {
    setCurrentModalJob(job)
  }

  function closeJobLogModal() {
    setCurrentModalJob(null)
  }

  function renderRefreshDatasetJobTaskMessage(job, updated, error, skipped) {
    return job.status !== 'STARTED' ? (
      <span className='modal-trigger' onClick={() => openJobLogModal(job)}>
        {job.status} - Oppdaterte {updated} spørringer, {error} feilet og {skipped} ignorert
        {error != 0 ? (
          <span className='warningIcon'>
            <AlertTriangle size='12' color='#FF4500' />
          </span>
        ) : (
          ''
        )}
      </span>
    ) : (
      <span>{job.status}</span>
    )
  }

  function renderInfo(job) {
    if (job.task === 'Publish statistics') {
      return (
        <span className='modal-trigger' onClick={() => openJobLogModal(job)}>
          {job.status} - {job.message}
        </span>
      )
    } else if (job.task === 'Refresh statreg data') {
      return (
        <React.Fragment>
          {job.status}
          <br />
          {job.result.map((res, index) => {
            const { status, displayName, infoMessage, showWarningIcon } = res
            return (
              <React.Fragment key={index}>
                {displayName} - {showWarningIcon ? <span className='error'>{status}</span> : status}
                {infoMessage ? ` : ${infoMessage}` : ''} <br />
              </React.Fragment>
            )
          })}
        </React.Fragment>
      )
    } else if (job.task === 'Refresh dataset') {
      const count = job.result.result.length
      const errorCount = job.result.result.filter((ds) => ds.hasError).length
      const ignoreCount = job.result.filterInfo && job.result.filterInfo.skipped && job.result.filterInfo.skipped.length
      return renderRefreshDatasetJobTaskMessage(job, count - errorCount, errorCount, ignoreCount)
    } else if (job.task === 'Refresh dataset calculators' || job.task === 'Refresh dataset for SDDS tables') {
      const skipped = job.result.result.filter((ds) => ds.status === 'Ingen nye data').length
      const updated = job.result.result.filter((ds) => ds.status === 'Dataset hentet og oppdatert').length
      const errorCount = job.result.result.filter((ds) => ds.hasError).length
      return renderRefreshDatasetJobTaskMessage(job, updated, errorCount, skipped)
    }
    return (
      <span>
        {job.status} - {job.message}
      </span>
    )
  }

  const ModalContent = () => {
    return (
      <Modal show={true} onHide={() => closeJobLogModal()} animation={false} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Logg detaljer</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderJobLogs()}</Modal.Body>
        <Modal.Footer>
          <Button secondary onClick={() => closeJobLogModal()}>
            Lukk
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  function renderJobLogs() {
    if (currentModalJob.task === 'Publish statistics') {
      return currentModalJob.result.map((statisticResult, index) => {
        return (
          <Accordion key={index} header={statisticResult.shortName} subHeader={statisticResult.status}>
            {statisticResult.dataSources.map((dataSource, index) => {
              return (
                <p key={index}>
                  {dataSource.status} -&nbsp;
                  <span className='small'>
                    <DataQueryBadges
                      contentType={dataSource.type}
                      format={dataSource.datasetType}
                      isPublished={true}
                      floatRight={false}
                    />
                  </span>
                  <br />
                  <Link isExternal href={contentStudioBaseUrl + dataSource.id}>
                    {dataSource.displayName}
                  </Link>{' '}
                  - {dataSource.datasetKey}
                </p>
              )
            })}
          </Accordion>
        )
      })
    } else if (
      currentModalJob.task === 'Refresh dataset' ||
      currentModalJob.task === 'Refresh dataset calculators' ||
      currentModalJob.task === 'Refresh dataset for SDDS tables'
    ) {
      return currentModalJob.result.result.map((dataSource) => {
        return (
          <React.Fragment key={`refresh_dataset_log_${dataSource.id}`}>
            <p>
              <Link isExternal href={contentStudioBaseUrl + dataSource.id}>
                {dataSource.displayName}
              </Link>
              <span className='small'>
                <DataQueryBadges
                  contentType={dataSource.contentType}
                  format={dataSource.dataSourceType}
                  isPublished={true}
                  floatRight={false}
                />
              </span>
              <br />
              {dataSource.status}
            </p>
            <Divider className='my-3' />
          </React.Fragment>
        )
      })
    }
  }

  return (
    <div className='p-4 tables-wrapper joblog'>
      <h2>Jobblogg</h2>
      <Container fluid className='job-log-container p-0'>
        <Row className='mb-3'>
          <Col>
            {loading ? renderSpinner() : renderTable()}
            {currentModalJob ? <ModalContent /> : null}
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default (props) => <Jobs {...props} />
