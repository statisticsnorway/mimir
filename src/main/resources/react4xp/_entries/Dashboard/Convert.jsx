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
      wsConnection: new ExpWS(),
      io: null
    }
  }

  startConvert(key) {
    const job = this.state.jobs.find((j) => j.key === key)
    job.running = true
    this.setState({
      jobs: this.state.jobs
    })

    this.state.io.emit(`${key}-start`)
  }

  onJobUpdate(jobInfo) {
    const job = this.state.jobs.find((j) => j.key === jobInfo.key)
    job.current = jobInfo.current
    this.setState({
      jobs: this.state.jobs
    })
  }

  setupWSListener(key) {
    this.state.io.on(`${key}-update`, (jobInfo) => this.onJobUpdate(jobInfo))
  }

  onConnectionClose(event) {
    console.log('Lost websocket connection to server', event)
  }

  componentDidMount() {
    Axios.get(this.props.convertServiceUrl).then((res) => {
      const {
        wsConnection
      } = this.state

      wsConnection.setEventHandler('close', (event) => {
        this.onConnectionClose(event)
      })

      this.setState({
        jobs: res.data.jobs,
        loadingJobs: false,
        io: new wsConnection.Io()
      })

      this.state.jobs.forEach((job) => {
        this.setupWSListener(job.key)
      })
    }).catch((err) => {
      console.log(err)
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
          <Row key={job.key}>
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

  render() {
    return (
      <Container className="dashboard-convert">
        {this.renderJobs()}
      </Container>
    )
  }
}

Convert.propTypes = {
  convertServiceUrl: PropTypes.string.isRequired
}

export default (props) => <Convert {...props} />
