import React, { useState } from 'react'
import { Divider, Title } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import axios from 'axios'
import { Col, Container, Row } from 'react-bootstrap'

function SearchExperiment(props) {
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [query, setQuery] = useState(props.query || '')
  const [sort, setSort] = useState('relevance')

  function fetchSearchResult() {
    if (!query) {
      // don't search if query is empty,
      return
    }
    setLoading(true)
    axios
      .get(props.searchUrl, {
        params: {
          start: 0,
          q: query,
          sort: sort,
        },
      })
      .then((res) => {
        setSearchResults(res.data)
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false))
  }

  function showSearchResults() {
    if (loading) {
      return <p>Loading...</p>
    }
    if (searchResults && searchResults.items && searchResults.items.length > 0) {
      return searchResults.items.map((item) => (
        <li key={item.cacheId}>
          <Row>
            <Divider />
            <a href={item.link}>
              <Title size={4}>{item.pagemap?.metatags[0]['og:title'] || item.title}</Title>
              <p>{item.snippet}</p>
            </a>
          </Row>
        </li>
      ))
    }
    return <p>No search results</p>
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      fetchSearchResult()
    }
  }

  function handleRadioChange(event) {
    setSort(event.target.value)
  }

  return (
    <div className='search-experiment'>
      <Title size={3}>Søk med Google!</Title>
      <div>
        <Container fluid='sm'>
          <Row className='align-items-start mb-2'>
            <Col sm={10}>
              <input
                name='searchTerm'
                type='text'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col lg={2}>
              <button onClick={fetchSearchResult}>Search</button>
            </Col>
          </Row>
          <Row className='mb-3'>
            <label>
              <input
                type='radio'
                value='relevance'
                checked={sort === 'relevance'}
                onChange={(e) => handleRadioChange(e)}
              />
              Relevance
            </label>
            <label>
              <input type='radio' value='date' checked={sort === 'date'} onChange={(e) => handleRadioChange(e)} />
              Date
            </label>
          </Row>
        </Container>
        <ul className='list-unstyled '>{showSearchResults()}</ul>
      </div>
    </div>
  )
}

SearchExperiment.propTypes = {
  searchUrl: PropTypes.string,
  query: PropTypes.string,
}

export default (props) => <SearchExperiment {...props} />
