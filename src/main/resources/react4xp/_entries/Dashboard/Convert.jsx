import React from 'react'
import PropTypes from 'prop-types'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import ProgressBar from 'react-bootstrap/ProgressBar'
import Button from 'react-bootstrap/Button'
import Axios from 'axios'

class Convert extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loadingJobs: true,
      errorMessage: ``,
      jobs: [],
      jobErrors: []
    }
  }

  startConvert(key) {
    const job = this.state.jobs.find((j) => j.key === key)
    job.running = true
    this.setState({
      jobs: this.state.jobs
    })

    this.props.io.emit(`${key}-start`)
  }

  onJobUpdate(jobInfo) {
    const job = this.state.jobs.find((j) => j.key === jobInfo.key)
    job.current = jobInfo.current
    this.setState({
      jobs: this.state.jobs
    })
  }

  setupWSListener(key) {
    this.props.io.on(`${key}-update`, (jobInfo) => this.onJobUpdate(jobInfo))
  }

  componentDidMount() {
    // fetch jobs from the server
    Axios.get(this.props.convertServiceUrl).then((res) => {
      this.setState({
        jobs: res.data.jobs,
        loadingJobs: false
      })

      // listen for convert error jobs
      this.props.io.on(`convert-error`, (errorInfo) => {
        this.setState({
          errors: (this.state.jobErrors.push(errorInfo))
        })
      })

      // setup listeners for each job
      this.state.jobs.forEach((job) => {
        this.setupWSListener(job.key)
      })
    }).catch((err) => {
      console.error(err)
      this.setState({
        errorMessage: `Feilet å hente jobber, prøv igjen eller kontakt utvikler`,
        loadingJobs: false
      })
    })
  }

  renderJobs() {
    if (this.state.loadingJobs) {
      return (
        <Row>
          <Col>
            <span className="spinner-border spinner-border" />
          </Col>
        </Row>
      )
    } else if (this.state.jobs.length === 0 || !this.state.jobs) {
      return (
        <Row>
          <Col>{this.state.errorMessage ? this.state.errorMessage : `Ingen konverterings jobber å kjøre`}</Col>
        </Row>
      )
    } else {
      return this.state.jobs.map((job) => {
        return (
          <Row key={job.key} className="mb-4">
            <Col className="col-4 convert-label">{`${job.label} (${job.max}stk)`}</Col>
            <Col className="col-6">
              <ProgressBar min={job.min} max={job.max} now={job.current} label={`${job.current}/${job.max}`} animated/>
            </Col>
            <Col className="col-2">
              <Button className="w-100" onClick={() => this.startConvert(job.key)} disabled={job.running}>{job.running ? `Kjører` : `Start`}</Button>
            </Col>
          </Row>
        )
      })
    }
  }

  renderJobErrors() {
    return this.state.jobErrors.map((jobError) => {
      return (
        <Row key={jobError.id} className="convert-error mb-1">
          <Col className="col-3">{jobError.displayName}</Col>
          <Col className="col-4">{jobError.path}</Col>
          <Col className="col-5">{jobError.error}</Col>
        </Row>
      )
    })
  }

  render() {
    return (
      <Container className="dashboard-convert">
        {this.renderJobs()}
        {this.renderJobErrors()}
      </Container>
    )
  }
}

Convert.propTypes = {
  convertServiceUrl: PropTypes.string.isRequired,
  io: PropTypes.object
}

export default (props) => <Convert {...props} />
