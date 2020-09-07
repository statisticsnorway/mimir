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
      statregDashboardServiceUrl,
      onSuccess,
      onError
    } = this.props
    if (statregDashboardServiceUrl) {
      this.setState({
        loading: true
      })

      console.log('trying to reach', statregDashboardServiceUrl)
      axios.get(statregDashboardServiceUrl)
        .then((response) => {
          if (onSuccess) {
            onSuccess(response.data.message)
          }
        })
        .catch((err) => {
          console.error(err)
          let message = err
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
      console.log('statregDashboardServiceUrl is null')
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
  statregDashboardServiceUrl: PropTypes.string,
  onSuccess: PropTypes.func,
  onError: PropTypes.func
}

export default (props) => <RefreshDataButton {...props} />
