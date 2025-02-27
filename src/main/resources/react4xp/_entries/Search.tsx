import React from 'react'
import { Input } from '@statisticsnorway/ssb-component-library'

interface SearchProps {
  searchText: string
  className: string
  searchResultPageUrl: string
}

const Search = (props: SearchProps) => {
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

export default (props: SearchProps) => <Search {...props} />
