import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Divider, Input, Link, Paragraph, Title, Dropdown } from '@statisticsnorway/ssb-component-library'
import { ChevronDown, X } from 'react-feather'
import axios from 'axios'
import NumberFormat from 'react-number-format'


function SearchResult(props) {
  const [hits, setHits] = useState(props.hits)
  const [searchTerm, setSearchTerm] = useState(props.term)
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(props.total)
  const [filterChanged, setFilterChanged] = useState(false)
  const [filter, setFilter] = useState({
    mainSubject: ''
  })
  const [selectedItem, setselectedItem] = useState(props.dropDownSubjects[0])

  useEffect(() => {
    if (filterChanged) {
      fetchFilteredSearchResult()
    }
  }, [filter])

  function onChange(id, value) {
    setFilterChanged(true)
    if (id === 'mainSubject') {
      setFilter({
        ...filter,
        mainSubject: value.id === '' ? '' : value.title
      })
    }
  }

  function removeFilter() {
    setFilter({
      ...filter,
      mainSubject: ''
    })
    setselectedItem(props.dropDownSubjects[0])
  }


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

  function fetchFilteredSearchResult() {
    setLoading(true)
    axios.get(props.searchServiceUrl, {
      params: {
        sok: searchTerm,
        start: 0,
        count: props.count,
        language: props.language,
        mainsubject: filter.mainSubject
      }
    }).then((res) => {
      setHits(res.data.hits)
      setTotal(res.data.total)
    }).finally(() => {
      setLoading(false)
    })
  }

  function fetchSearchResult() {
    setLoading(true)
    axios.get(props.searchServiceUrl, {
      params: {
        sok: searchTerm,
        start: hits.length,
        count: props.count,
        language: props.language,
        mainsubject: filter.mainSubject
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

  function addDropdownSubject(id) {
    const dropDownSubjects = props.dropDownSubjects
    return (
      <Dropdown
        className="mainSubject"
        id={id}
        onSelect={(value) => {
          onChange(id, value)
        }}
        selectedItem={dropDownSubjects[0]}
        items={dropDownSubjects}
      />
    )
  }

  function renderClearFilterButton() {
    if (filter.mainSubject !== '') {
      return (
        <Button
          className="button-more mt-5"
          onClick={removeFilter}
        >
          <X size="18"/> Fjern alle filtervalg
        </Button>
      )
    }
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
            <div className="filter mt-5">
              <Title size={6}>Avgrens treffene</Title>
              {addDropdownSubject('mainSubject')}
              {renderClearFilterButton()}
            </div>
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
  }),
  dropDownSubjects: PropTypes.array
}

export default (props) => <SearchResult {...props} />
