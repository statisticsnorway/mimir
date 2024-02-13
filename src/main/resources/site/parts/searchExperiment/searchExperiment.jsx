import React, { useState } from 'react'
import { Divider, Title } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import axios from 'axios'
import { Col, Container, Row } from 'react-bootstrap'

function SearchExperiment(props) {
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [query, setQuery] = useState(props.query || '')

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
    if (searchResults) {
      return searchResults.items.map((item) => (
        <li key={item.cacheId}>
          <Row>
            <Divider />
            <a href={item.link}>
              <Title size={4}>{item.title}</Title>
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

  return (
    <div className='search-experiment'>
      <Title size={3}>Søk med Google!</Title>
      <div>
        <Container fluid='sm'>
          <Row className='align-items-start'>
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
