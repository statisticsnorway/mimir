import React from 'react'
import PropTypes from 'prop-types'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Badge from 'react-bootstrap/Badge'
import ProgressBar from 'react-bootstrap/ProgressBar'
import Button from 'react-bootstrap/Button'
import Axios from 'axios'
import { Zap, ZapOff } from 'react-feather'

class Convert extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loadingJobs: true,
      errorMessage: ``,
      jobs: [],
      wsConnection: new ExpWS(),
      io: null,
      isConnected: false
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
    this.setState({
      isConnected: false
    })
  }

  onConnectionOpen(event) {
    this.setState({
      isConnected: true
    })
  }

  componentDidMount() {
    Axios.get(this.props.convertServiceUrl).then((res) => {
      const {
        wsConnection
      } = this.state

      wsConnection.setEventHandler('close', (event) => {
        this.onConnectionClose(event)
      })

      wsConnection.setEventHandler('open', (event) => {
        this.onConnectionOpen(event)
      })

      this.setState({
        jobs: res.data.jobs,
        loadingJobs: false,
        io: new wsConnection.Io()
      })

      setInterval(() => {
        this.state.io.emit('keep-alive', 'ping')
      }, 1000 * 60 * 3)

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

  renderBadge() {
    if (this.state.isConnected) {
      return (<span>Connected<Zap></Zap></span>)
    } else {
      return (<span>Disconnected<ZapOff></ZapOff></span>)
    }
  }

  render() {
    return (
      <Container className="dashboard-convert">
        <Row>
          <Col>
            <Badge variant={this.state.isConnected ? 'success' : 'danger'}>
              {
                this.renderBadge()
              }
            </Badge>
          </Col>
        </Row>
        {this.renderJobs()}
      </Container>
    )
  }
}

Convert.propTypes = {
  convertServiceUrl: PropTypes.string.isRequired
}

export default (props) => <Convert {...props} />
