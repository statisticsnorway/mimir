import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Input, Title } from '@statisticsnorway/ssb-component-library'
import { ChevronDown } from 'react-feather'
import axios from 'axios'


function SearchResult(props) {
  const [hits, setHits] = useState(props.hits)
  const [loading, setLoading] = useState(false)


  function renderList() {
    return (
      <ol>
        {hits.map( (hit, i) => {
          return (
            <li key={i}>
              <h3 className="search-result-ingress" dangerouslySetInnerHTML={{
                __html: hit.title.replace(/&nbsp;/g, ' ')
              }}>
              </h3>
              <div className="search-result-ingress" dangerouslySetInnerHTML={{
                __html: hit.preface.replace(/&nbsp;/g, ' ')
              }}>
              </div>

            </li>
          )
        })}
      </ol>
    )
  }

  function renderLoading() {
    if (loading) {
      return (
        <div className="row">
          <div className="col">
            <span className="spinner-border spinner-border" />
          </div>
        </div>
      )
    }
  }

  function fetchSearchResult() {
    setLoading(true)
    axios.get(props.searchServiceUrl, {
      params: {
        sok: props.term,
        start: hits.length,
        count: 10,
        language: props.language
      }
    }).then((res) => {
      console.log('hi')
      // setHits(hits.concat(res.data.hits))
      // setTotal(res.data.total)
    }).finally(() => {
      setLoading(false)
    })
  }

  return (
    <section>
      <div className="search-result-head py-5 px-2">
        <Title>{props.title}</Title>
        <Input></Input>
      </div>
      <div className="container search-result-body mt-5">

        {renderList()}
        {renderLoading()}
        <div>
          <Button
            disabled={loading || props.total === hits.length}
            className="button-more mt-5"
            onClick={fetchSearchResult}
          >
            <ChevronDown size="18"/> {props.buttonTitle}
          </Button>
        </div>
      </div>
    </section>
  )
}


SearchResult.propTypes = {
  title: PropTypes.string,
  total: PropTypes.number,
  buttonTitle: PropTypes.string,
  searchServiceUrl: PropTypes.string,
  language: PropTypes.string,
  term: PropTypes.string,
  hits: PropTypes.arrayOf({
    title: PropTypes.string,
    url: PropTypes.string,
    preface: PropTypes.string,
    mainSubject: PropTypes.string,
    contentType: PropTypes.string
  })
}

export default (props) => <SearchResult {...props} />
