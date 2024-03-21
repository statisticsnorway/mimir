import React from 'react'
import { Title, Dropdown } from '@statisticsnorway/ssb-component-library'

interface LocalSearchProps {
  title?: string
  placeholder?: string
  items: {
    title: string
    url: string
    id: string
  }[]
}

class LocalSearch extends React.Component<LocalSearchProps> {
  constructor(props: LocalSearchProps) {
    super(props)
  }

  onSelect(selectedItem: LocalSearchProps['items'][0]) {
    window.location.href = selectedItem.url
  }

  render() {
    return (
      <section className='xp-part part-local-search container'>
        <div className='container'>
          <div className='row'>
            <div className='col-12'>
              <Title size={2}>{this.props.title}</Title>
              <Dropdown
                placeholder={this.props.placeholder}
                searchable
                largeSize
                onSelect={(selectedItem: LocalSearchProps['items'][0]) => this.onSelect(selectedItem)}
                items={this.props.items}
                className='search-field'
                ariaLabel={this.props.placeholder}
              />
            </div>
          </div>
        </div>
      </section>
    )
  }
}

export default (props: LocalSearchProps) => <LocalSearch {...props} />
