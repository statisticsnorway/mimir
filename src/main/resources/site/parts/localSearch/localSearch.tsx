import React from 'react'
import { Title, Dropdown } from '@statisticsnorway/ssb-component-library'
import { type SearchItem } from '../../../lib/types/partTypes/localSearch'

interface LocalSearchProps {
  title?: string
  placeholder?: string
  items: SearchItem[]
}

const LocalSearch = (props: LocalSearchProps) => {
  const { title, placeholder, items } = props

  function onSelect(selectedItem: LocalSearchProps['items'][0]) {
    window.location.href = selectedItem.url
  }

  return (
    <section className='xp-part part-local-search container'>
      <div className='container'>
        <div className='row'>
          <div className='col-12'>
            <Title size={2}>{title}</Title>
            <Dropdown
              placeholder={placeholder}
              searchable
              largeSize
              onSelect={(selectedItem: LocalSearchProps['items'][0]) => onSelect(selectedItem)}
              items={items}
              className='search-field'
              ariaLabel={placeholder}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default LocalSearch
