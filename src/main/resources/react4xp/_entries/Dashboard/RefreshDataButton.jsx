import Button from 'react-bootstrap/Button'
import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'

class RefreshDataButton extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false
    }
  }

  refreshData() {
    const {
      refreshDataServiceUrl,
      onSuccess,
      onError
    } = this.props
    if (refreshDataServiceUrl) {
      this.setState({
        loading: true
      })

      console.log('trying to reach', refreshDataServiceUrl);
      axios.get(refreshDataServiceUrl)
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
    } else {
      console.log('refreshDataServiceUrl is null')
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
      <Button
        onClick={() => this.refreshData()}
        disabled={this.state.loading}
      >
        Oppdater data
      </Button>
    )
  }
}

RefreshDataButton.propTypes = {
  refreshDataServiceUrl: PropTypes.string,
  onSuccess: PropTypes.func,
  onError: PropTypes.func
}

export default (props) => <RefreshDataButton {...props} />
