import React from 'react'
import { Input } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

const Search = (props) => {
  // No pageContributions in error mode, so can't hydrate React components. Thus we go for a simple form.
  return (
    <form action={props.searchResultPageUrl} method='get'>
      <Input
        id='search_ssb'
        name='sok'
        ariaLabel={props.searchText}
        searchField
        placeholder={props.searchText}
        ariaLabelSearchButton={props.searchText}
        className={props.className}
      />
    </form>
  )
}

Search.propTypes = {
  searchText: PropTypes.string,
  className: PropTypes.string,
  searchResultPageUrl: PropTypes.string,
}

export default (props) => <Search {...props} />
