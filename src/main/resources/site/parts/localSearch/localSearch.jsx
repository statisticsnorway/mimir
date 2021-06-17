import React from 'react'
import { Dropdown } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

class LocalSearch extends React.Component {
  constructor(props) {
    super(props)
  }

  onSelect(selectedItem) {
    window.location.href = selectedItem.url
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h2>{this.props.title}</h2>
            <Dropdown placeholder={this.props.placeholder} searchable onSelect={(selectedItem)=> this.onSelect(selectedItem)} items={this.props.items} />
          </div>
        </div>
      </div>
    )
  }
}

LocalSearch.propTypes = {
  title: PropTypes.string,
  placeholder: PropTypes.string,
  items: PropTypes.arrayOf({
    title: PropTypes.string,
    id: PropTypes.string,
    url: PropTypes.string
  })
}

export default (props) => <LocalSearch {...props} />
