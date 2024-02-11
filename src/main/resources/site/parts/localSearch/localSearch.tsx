import React from 'react'
import { Title, Dropdown } from '@statisticsnorway/ssb-component-library'

interface LocalSearchProps {
  title?: string;
  placeholder?: string;
  items?: unknown[];
}

class LocalSearch extends React.Component<LocalSearchProps> {
  constructor(props) {
    super(props)
  }

  onSelect(selectedItem) {
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
                onSelect={(selectedItem) => this.onSelect(selectedItem)}
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

export default (props) => <LocalSearch {...props} />
