import Button from 'react-bootstrap/Button'
import React from 'react'
import PropTypes from 'prop-types';
import { RefreshCw } from 'react-feather'
import {DataQuery} from './Dashboard';

class DashboardButtons extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      queIndex: 0,
      maxThreads: 4,
      loading: false
    }
  }

  threadStarter() {
    this.setState({
      loading: true
    })
    const initArray = Array.apply(null, {length: this.state.maxThreads}).map(Number.call, Number)

    const threads = initArray.map( (i) => {
      this.setState((state) => ({ queIndex: state.queIndex + 1 }))
      return new Promise((resolve) => this.thread(resolve, this.props.dataQueries[i]))
    })
    Promise.all(threads).then( (values) => {
      this.setState({
        queIndex: 0,
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
    }).finally(() => {
      this.props.setLoading(dataquery.id, false)
      const qI = this.state.queIndex
      this.setState({queIndex: this.state.queIndex + 1})
      if(qI < this.props.dataQueries.length) {
        return this.thread(resolve, this.props.dataQueries[qI])
      } else {
        return resolve('OK')
      }
    })
  }

  render() {
    return (
      <div className="my-3">
        <Button onClick={() => this.threadStarter()}>Oppdater liste
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
  setLoading: PropTypes.func
}
