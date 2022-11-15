import React from 'react'
import { Input } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

const Search = (props) => {
  const handleSubmit = (value) => {
    window.location = `${props.searchResultPageUrl}?sok=${value}`
  }

  return (
    <React.Fragment>
      <Input
        id='search_ssb'
        ariaLabel={props.searchText}
        searchField
        submitCallback={handleSubmit}
        placeholder={props.searchText}
        ariaLabelSearchButton={props.searchText}
        className={props.className}
      />
    </React.Fragment>
  )
}

Search.propTypes = {
  searchText: PropTypes.string,
  className: PropTypes.string,
  searchResultPageUrl: PropTypes.string,
}

export default Search
