import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Divider, Input, Link, Paragraph, Title, Dropdown, Tag } from '@statisticsnorway/ssb-component-library'
import { ChevronDown, X } from 'react-feather'
import axios from 'axios'
import NumberFormat from 'react-number-format'
import { Col, Row } from 'react-bootstrap'


function SearchResult(props) {
  const [hits, setHits] = useState(props.hits)
  const [searchTerm, setSearchTerm] = useState(props.term)
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(props.total)
  const [filterChanged, setFilterChanged] = useState(false)
  const [filter, setFilter] = useState({
    mainSubject: '',
    contentType: ''
  })
  const [selectedMainSubject, setSelectedMainSubject] = useState(props.dropDownSubjects[0])
  const [selectedContentType, setSelectedContentType] = useState(props.dropDownContentTypes[0])

  useEffect(() => {
    if (filterChanged) {
      fetchFilteredSearchResult()
    }
  }, [filter])

  function onChange(id, value) {
    setFilterChanged(true)

    if (id === 'mainSubject') {
      setSelectedMainSubject(value)
      setFilter({
        ...filter,
        mainSubject: value.id === '' ? '' : value.title
      })
    }

    if (id === 'contentType') {
      setSelectedContentType(value)
      setFilter({
        ...filter,
        contentType: value.id === '' ? '' : value.id
      })
    }
  }

  function removeFilter() {
    setFilter({
      mainSubject: '',
      contentType: ''
    })
    setSelectedContentType(props.dropDownContentTypes[0])
    setSelectedMainSubject(props.dropDownSubjects[0])
  }


  function renderList() {
    return (
      <div>
        <div className="row mb-4">
          <div className="col">
            {props.showingPhrase.replace('{0}', hits.length.toString())}&nbsp;<NumberFormat
              value={ Number(total) }
              displayType={'text'}
              thousandSeparator={' '}/>
            <Divider dark></Divider>
          </div>
        </div>
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
      </div>
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
        mainsubject: filter.mainSubject,
        contentType: filter.contentType
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
        mainsubject: filter.mainSubject,
        contentType: filter.contentType
      }
    }).then((res) => {
      setHits(hits.concat(res.data.hits))
      setTotal(res.data.total)
    }).finally(() => {
      setLoading(false)
    })
  }

  function renderShowMoreButton() {
    if (hits.length > 0) {
      return (
        <div>
          <Button
            disabled={loading || total === hits.length}
            className="button-more mt-5"
            onClick={fetchSearchResult}
          >
            <ChevronDown size="18"/> {props.buttonTitle}
          </Button>
        </div>
      )
    }
  }


  function renderNoHitMessage() {
    if (props.language === 'en') {
      return (
        <div>
          <Title size={2}>{props.noHitMessage}</Title>
          <p>Go to <Link href="/en/navn">name search</Link></p>
          <p>See <Link href="/en/publiseringsarkiv">list of all our published statistics, analyses and articles </Link></p>
          <p>Go to <Link href="/en/statbank">Statbank</Link> to find all our figures and tables</p>
        </div>
      )
    } else {
      return (
        <div>
          <Title size={2}>{props.noHitMessage}</Title>
          <p>Her finner du <Link href="/navn">navnesøk</Link></p>
          <p>Her finner du <Link href="/publikasjonsarkiv">liste over alle publiserte statistikker, analyser og artikler </Link></p>
          <p>I verktøyet <Link href="/statbank">Statistikkbanken</Link> finner du alle tallene våre</p>
        </div>
      )
    }
  }

  function goToSearchResultPage() {
    window.location = `${props.searchPageUrl}?sok=${searchTerm}`
  }

  const DropdownMainSubject = React.forwardRef((_props, ref) => (
    <Dropdown
      ref={ref}
      className="DropdownMainSubject"
      id='mainSubject'
      onSelect={(value) => {
        onChange('mainSubject', value)
      }}
      selectedItem={selectedMainSubject}
      items={props.dropDownSubjects}
    />
  ))

  const DropdownContentType = React.forwardRef((_props, ref) => (
    <Dropdown
      ref={ref}
      className="DropdownContentType"
      id='contentType'
      onSelect={(value) => {
        onChange('contentType', value)
      }}
      selectedItem={selectedContentType}
      items={props.dropDownContentTypes}
    />
  ))

  function renderClearFilterButton() {
    if (filter.mainSubject || filter.contentType) {
      return (
        <Tag
          className="mt-4"
          onClick={removeFilter}
          icon={<X size={18} />}
        >{props.removeFilterPhrase}
        </Tag>
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
              <Title size={6}>{props.limitResultPhrase}</Title>
              <Row>
                <Col>
                  <DropdownMainSubject/>
                </Col>
                <Col>
                  <DropdownContentType/>
                </Col>
              </Row>
              {renderClearFilterButton()}
            </div>
          </div>
        </div>
        <div className="col-12 search-result-body">
          <div className="container mt-5">
            {hits.length > 0 ? renderList() : renderNoHitMessage()}
            {renderLoading()}
            {renderShowMoreButton()}
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
  limitResultPhrase: PropTypes.string,
  removeFilterPhrase: PropTypes.string,
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
  dropDownSubjects: PropTypes.array,
  dropDownContentTypes: PropTypes.array
}

export default (props) => <SearchResult {...props} />
