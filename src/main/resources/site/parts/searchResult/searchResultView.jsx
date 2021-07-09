import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Divider, Input, Link, Paragraph, Title } from '@statisticsnorway/ssb-component-library'
import { ChevronDown } from 'react-feather'
import axios from 'axios'
import NumberFormat from 'react-number-format'


function SearchResult(props) {
  const [hits, setHits] = useState(props.hits)
  const [searchTerm, setSearchTerm] = useState(props.term)
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(props.total)


  function renderList() {
    return (
      <ol className="list-unstyled ">
        {hits.map( (hit, i) => {
          return (
            <li key={i} className="mb-4">
              <Link href={hit.url} className="ssb-link header" >
                <span dangerouslySetInnerHTML={{
                  __html: hit.title.replace(/&nbsp;/g, ' ')
                }}></span>
              </Link>
              <Paragraph className="search-result-ingress my-1" ><span dangerouslySetInnerHTML={{
                __html: hit.preface.replace(/&nbsp;/g, ' ')
              }}></span>
              </Paragraph>
              <Paragraph className="metadata">
                <span className="type">{hit.contentType}</span> /&nbsp;
                <time dateTime={hit.publishDate}>{hit.publishDateHuman}</time> /&nbsp;
                {hit.mainSubject}
              </Paragraph>
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
        sok: searchTerm,
        start: hits.length,
        count: props.count,
        language: props.language
      }
    }).then((res) => {
      setHits(hits.concat(res.data.hits))
      setTotal(res.data.total)
    }).finally(() => {
      setLoading(false)
    })
  }

  function renderNoHitMessage() {
    return (
      <p>{props.noHitMessage.replace('{0}', `"${props.term}"`)}</p>
    )
  }

  function goToSearchResultPage() {
    window.location = `${props.searchPageUrl}?sok=${searchTerm}`
  }

  return (
    <section className="search-result container-fluid">
      <div className="row">
        <div className="col-12 search-result-head">
          <div className="container py-5">
            <Title>{props.title}</Title>
            <Input
              size="lg"
              value={searchTerm} handleChange={setSearchTerm} searchField
              submitCallback={goToSearchResultPage}></Input>
          </div>
        </div>
        <div className="col-12 search-result-body">
          <div className="container mt-5">
            <div className="row mb-4">
              <div className="col">
                {props.showingPhrase.replace('{0}', hits.length.toString())}&nbsp;<NumberFormat
                  value={ Number(total) }
                  displayType={'text'}
                  thousandSeparator={' '}/>
                <Divider dark></Divider>
              </div>
            </div>
            {hits.length > 0 ? renderList() : renderNoHitMessage()}
            {renderLoading()}
            <div>
              <Button
                disabled={loading || total === hits.length}
                className="button-more mt-5"
                onClick={fetchSearchResult}
              >
                <ChevronDown size="18"/> {props.buttonTitle}
              </Button>
            </div>
          </div>
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
  searchPageUrl: PropTypes.stirng,
  language: PropTypes.string,
  term: PropTypes.string,
  showingPhrase: PropTypes.string,
  count: PropTypes.number,
  noHitMessage: PropTypes.string,
  hits: PropTypes.arrayOf({
    title: PropTypes.string,
    url: PropTypes.string,
    preface: PropTypes.string,
    mainSubject: PropTypes.string,
    contentType: PropTypes.string,
    publishDate: PropTypes.string,
    publishDateHuman: PropTypes.string
  })
}

export default (props) => <SearchResult {...props} />
