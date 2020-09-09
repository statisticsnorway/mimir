import Button from 'react-bootstrap/Button'
import React from 'react'
import PropTypes from 'prop-types'
import { RefreshCw } from 'react-feather'
import { DataQuery } from './Dashboard'

class DashboardButtons extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      queueIndex: 0,
      maxThreads: 4,
      loading: false
    }
  }

  threadStarter() {
    this.setState({
      loading: true
    })

    const maxThreads = this.state.maxThreads > this.props.dataQueries.length ? this.props.dataQueries.length : this.state.maxThreads
    const threads = Array(maxThreads).fill(0).map( (c, i) => {
      this.setState((state) => ({
        queueIndex: state.queueIndex + 1
      }))
      return new Promise((resolve) => this.thread(resolve, this.props.dataQueries[i]))
    })

    Promise.all(threads).then( (values) => {
      this.setState({
        queueIndex: 0,
        loading: false
      })
    })
  }

  thread(resolve, dataquery) {
    this.props.setLoading(dataquery.id, true)
    this.props.getRequest(dataquery.id)
      .then((response) => {
        if (response.status === 200) {
          this.props.refreshRow(response.data.updates)
        }
      }).catch((e) => {
        console.log(e)
        this.props.refreshRow(e.response.data.updates)
      })
      .finally(() => {
        this.props.setLoading(dataquery.id, false)
        const qI = this.state.queueIndex
        this.setState({
          queueIndex: this.state.queueIndex + 1
        })
        if (qI < this.props.dataQueries.length) {
          return this.thread(resolve, this.props.dataQueries[qI])
        } else {
          return resolve('OK')
        }
      })
  }

  render() {
    const {
      className
    } = this.props
    return (
      <div className={`${className ? className : ''}`}>
        <Button onClick={() => this.threadStarter()}>{this.props.buttonText || 'Oppdater liste'}
          {this.state.loading ? <span className="spinner-border spinner-border-sm ml-2 mb-1" /> : <RefreshCw className="ml-2" />}
        </Button>
      </div>
    )
  }
}

export default (props) => <DashboardButtons {...props} />

DashboardButtons.propTypes = {
  dataQueries: PropTypes.arrayOf(PropTypes.shape(DataQuery)),
  refreshRow: PropTypes.func,
  getRequest: PropTypes.func,
  setLoading: PropTypes.func,
  buttonText: PropTypes.string,
  className: PropTypes.string
}
