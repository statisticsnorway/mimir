import Button from 'react-bootstrap/Button'
import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'

class ClearCacheButton extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false
    }
  }

  clearCache() {
    const {
      clearCacheServiceUrl,
      onSuccess,
      onError
    } = this.props
    if (clearCacheServiceUrl) {
      this.setState({
        loading: true
      })

      axios.get(clearCacheServiceUrl)
        .then((response) => {
          if (onSuccess) {
            onSuccess(response.data.message)
          }
        })
        .catch((err) => {
          console.error(err)
          const message = err
          if (err.response.data.message) {
            message = err.response.data.message
          }
          if (onError) {
            onError(message.toString())
          }
        })
        .finally(() => {
          this.setState({
            loading: false
          })
        })
    }
  }


  renderSpinner() {
    if (this.state.loading) {
      return (<span className="spinner-border spinner-border-sm ml-2 mb-1" />)
    }
    return null
  }

  render() {
    return (
      <Button onClick={() => this.clearCache()} disabled={this.state.loading}>{this.renderSpinner()} Tøm Cache</Button>
    )
  }
}

ClearCacheButton.propTypes = {
  clearCacheServiceUrl: PropTypes.string,
  onSuccess: PropTypes.func,
  onError: PropTypes.func
}

export default (props) => <ClearCacheButton {...props} />
