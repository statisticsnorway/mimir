import React, { useState, useEffect, useRef } from 'react'
import { useMediaQuery } from 'react-responsive'

import PropTypes from 'prop-types'
import { Card,
  Divider,
  Input,
  Link,
  Paragraph,
  Title,
  Dropdown,
  Tag,
  RadioGroup,
  Accordion } from '@statisticsnorway/ssb-component-library'
import { ChevronDown, User, X } from 'react-feather'
import axios from 'axios'
import NumberFormat from 'react-number-format'
import { Col, Row } from 'react-bootstrap'
import { addGtagForEvent } from '../../../react4xp/ReactGA'

function SearchResult(props) {
  const [hits, setHits] = useState(props.hits)
  const [searchTerm, setSearchTerm] = useState(props.term)
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(props.total)
  const [contentTypes, setContentTypes] = useState(props.contentTypes)
  const [subjects, setSubjects] = useState(props.subjects)
  const [filterChanged, setFilterChanged] = useState(false)
  const [nameSearchData, setNameSearchData] = useState(undefined)
  const [mainNameResult, setMainNameResult] = useState(undefined)
  const [sortChanged, setSortChanged] = useState(false)
  const [sortList, setSortList] = useState(undefined)
  const [filter, setFilter] = useState({
    mainSubject: props.subjectUrlParam ? props.subjectUrlParam : '',
    contentType: props.contentTypeUrlParam ? props.contentTypeUrlParam : ''
  })
  const allContentTypeItem = {
    id: 'allTypes',
    title: props.allContentTypesPhrase
  }
  const preselectedContentTypeDropdownItem = props.contentTypeUrlParam ? {
    id: props.contentTypeUrlParam,
    title: props.contentTypePhrases.find((phrase) => phrase.id === props.contentTypeUrlParam).title
  } : allContentTypeItem
  const allSubjectsItem = {
    id: 'allSubjects',
    title: props.allSubjectsPhrase
  }
  const preselectedSubjectDropdownItem = props.subjectUrlParam ? {
    id: props.subjectUrlParam,
    title: props.subjectUrlParam
  } : allSubjectsItem
  const [selectedContentType, setSelectedContentType] = useState(preselectedContentTypeDropdownItem)
  const [selectedMainSubject, setSelectedMainSubject] = useState(preselectedSubjectDropdownItem)
  const [numberChanged, setNumberChanged] = useState(0)
  const currentElement = useRef(null)

  const mobile = useMediaQuery({
    maxWidth: 991 // lg breakpoint from bootstrap v.5
  })

  useEffect(() => {
    if (!nameSearchData) {
      try {
        getNameSearch(searchTerm)
      } catch (e) {
        console.log(e)
      }
    }
    if (filterChanged || sortChanged) {
      fetchFilteredSearchResult()
    }
    // GA events for best bet and zero hits results
    if (props.bestBetHit) {
      addGtagForEvent(props.GA_TRACKING_ID, 'Best Bet', 'Søk', searchTerm)
    }
    if ((!props.bestBetHit) && (!hits.length)) {
      addGtagForEvent(props.GA_TRACKING_ID, 'Null treff', 'Søk', searchTerm)
    }
  }, [filter, sortList])

  function onChange(id, value) {
    setFilterChanged(true)

    if (id === 'mainSubject') {
      const selectedSubject = value.id === 'allSubjects' ? value : {
        id: value.id,
        title: value.id
      }
      setSelectedMainSubject(selectedSubject)
      setFilter({
        ...filter,
        mainSubject: value.id === '' || value.id === 'allSubjects' ? '' : value.id
      })
    }

    if (id === 'contentType') {
      const selectedContentType = value.id === 'allTypes' ? value : {
        id: value.id,
        title: props.contentTypePhrases.find((phrase) => phrase.id === value.id).title
      }

      setSelectedContentType(selectedContentType)
      setFilter({
        ...filter,
        contentType: value.id === '' || value.id === 'allTypes' ? '' : value.id
      })
    }
  }

  function onChangeSortList(value) {
    setSortChanged(true)
    setSortList(value)

    if (sortChanged) {
      setNumberChanged((prev) => prev + 1)
      if (props.GA_TRACKING_ID && numberChanged < 2) {
        const sortLabel = value === 'best' ? props.sortBestHitPhrase : props.sortDatePhrase
        addGtagForEvent(props.GA_TRACKING_ID, 'Sorter', 'Søk', sortLabel)
      }
    }
  }
  function onShowMoreSearchResults(focusElement) {
    fetchSearchResult(focusElement)
    addGtagForEvent(props.GA_TRACKING_ID, 'Klikk', 'Søk', 'Vis flere')
  }

  function removeFilter() {
    setFilter({
      mainSubject: '',
      contentType: ''
    })
    setSelectedContentType(allContentTypeItem)
    setSelectedMainSubject(allSubjectsItem)
    addGtagForEvent(props.GA_TRACKING_ID, 'Klikk', 'Søk', 'Fjern alle filtervalg')
  }

  function renderListItem(hit, i) {
    if (hit) {
      const last = i === hits.length - props.count
      return (
        <li key={i ? i : undefined} className="mb-4">
          <a
            ref={last ? currentElement : null}
            className="ssb-link header"
            href={hit.url}
            onClick={() => {
              addGtagForEvent(props.GA_TRACKING_ID, 'Klikk på lenke', 'Søk', `${searchTerm} - Lenke nummer: ${i + 1}`)
            }}
          >
            <span dangerouslySetInnerHTML={{
              __html: hit.title.replace(/&nbsp;/g, ' ')
            }}></span>
          </a>
          <Paragraph className="search-result-ingress my-1" ><span dangerouslySetInnerHTML={{
            __html: hit.preface.replace(/&nbsp;/g, ' ')
          }}></span>
          </Paragraph>
          <Paragraph className="metadata">
            <span className="type">{hit.contentType}</span> {((hit.contentType && hit.publishDateHuman) || (hit.contentType && hit.mainSubject)) && ` / `}
            <time dateTime={hit.publishDate}>{hit.publishDateHuman}</time> {hit.publishDateHuman && hit.mainSubject && ` / `}
            {hit.mainSubject}
          </Paragraph>
        </li>
      )
    }
    return null
  }

  function renderList() {
    const bestBetHit = props.bestBetHit
    // The screen reader counts how many elements are in the list, so the best bet hit count needs to be included in the view for consistency
    const currentAmount = bestBetHit ? (hits.length + 1).toString() : hits.length.toString()
    const totalHits = bestBetHit ? total + 1 : total
    return (
      <div>
        <div className="row mb-4">
          <Col className="total-hits col-12 col-md-4" aria-live="polite" aria-atomic="true">
            {props.showingPhrase.replace('{0}', currentAmount)}&nbsp;<NumberFormat
              value={ Number(totalHits) }
              displayType={'text'}
              thousandSeparator={' '}/>
          </Col>
          <Col className="choose-sorting col-12 col-md-8">
            <span className='sort-title'>{`${props.sortPhrase}:`}</span>
            {renderRadiobuttonSort()}
          </Col>
          <Divider dark />
        </div>
        {props.nameSearchToggle ? renderNameResult() : undefined}
        <ol className="list-unstyled ">
          {renderListItem(bestBetHit)}
          {hits.map( (hit, i) => {
            return renderListItem(hit, i)
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
    const mainSubject = filter.mainSubject
    const contentType = filter.contentType

    setLoading(true)
    axios.get(props.searchServiceUrl, {
      params: {
        sok: searchTerm,
        start: 0,
        count: props.count,
        language: props.language,
        mainsubject: mainSubject,
        contentType: contentType,
        sort: sortList === 'publiseringsdato' ? sortList : undefined
      }
    }).then((res) => {
      setHits(res.data.hits)
      setTotal(res.data.total)
      setContentTypes(res.data.contentTypes)
      setSubjects(res.data.subjects)
    }).finally(() => {
      setLoading(false)
      const mainSubjectQueryString = mainSubject ? `&emne=${mainSubject}` : ''
      const contentTypeQueryString = contentType ? `&innholdstype=${contentType}` : ''
      window.history.pushState({}, '', `?sok=${searchTerm}${mainSubjectQueryString}${contentTypeQueryString}`)
    })
  }

  function fetchSearchResult(focusElement) {
    setLoading(true)
    axios.get(props.searchServiceUrl, {
      params: {
        sok: searchTerm,
        start: hits.length,
        count: props.count,
        language: props.language,
        mainsubject: filter.mainSubject,
        contentType: filter.contentType,
        sort: sortList === 'publiseringsdato' ? sortList : undefined
      }
    }).then((res) => {
      setHits(hits.concat(res.data.hits))
      setTotal(res.data.total)
      setContentTypes(res.data.contentTypes)
      setSubjects(res.data.subjects)
    }).finally(() => {
      setLoading(false)
      if (focusElement) {
        currentElement.current.focus()
      }
    })
  }

  function renderShowMoreButton() {
    if (hits.length > 0) {
      return (
        <div>
          <button
            disabled={loading || total === hits.length}
            className="ssb-btn button-more mt-5"
            onClick={() => onShowMoreSearchResults(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onShowMoreSearchResults(true)
              }
            }}
          >
            <ChevronDown size="18"/> {props.buttonTitle}
          </button>
        </div>
      )
    }
  }

  function renderNoHitMessage() {
    if (props.language === 'en') {
      return (
        <div>
          { props.nameSearchToggle ? renderNameResult() : undefined }
          <Title size={2}>{props.noHitMessage}</Title>
          <p>Go to <Link href="/en/navn">name search</Link></p>
          <p>See <Link href="/en/publiseringsarkiv">list of all our published statistics, analyses and articles </Link></p>
          <p>Go to <Link href="/en/statbank">Statbank</Link> to find all our figures and tables</p>
        </div>
      )
    } else {
      return (
        <div>
          { props.nameSearchToggle ? renderNameResult() : undefined }
          <Title size={2}>{props.noHitMessage}</Title>
          <p>Her finner du <Link href="/navn">navnesøk</Link></p>
          <p>Her finner du <Link href="/publiseringsarkiv">liste over alle publiserte statistikker, analyser og artikler </Link></p>
          <p>I verktøyet <Link href="/statbank">Statistikkbanken</Link> finner du alle tallene våre</p>
        </div>
      )
    }
  }

  function goToSearchResultPage() {
    window.location = `${props.searchPageUrl}?sok=${searchTerm}`
  }

  function getNameSearch(term) {
    axios.get(props.nameSearchUrl, {
      params: {
        'name': term
      }
    }).then((result) => {
      setNameSearchData(result.data)
      findMainResult(result.data.response.docs, searchTerm)
    }).catch((e) => {
      setNameSearchData({
        'error': e
      })
    })
  }

  function capitalizeNames(name) {
    const nameTokens = name.toLowerCase().split(' ')
    const capitalizedTokens = nameTokens.map((n)=>{
      const first = n.slice(0, 1).toUpperCase()
      const rest = n.slice(1)
      return first + rest
    })
    return capitalizedTokens.join(' ')
  }

  function findMainResult(docs, originalName) {
    // only get result with same name as the input
    const filteredResult = docs.filter((doc) => doc.name === originalName.toUpperCase())
    const mainRes = filteredResult.length && filteredResult.reduce((acc, current) => {
      if (!acc || acc.count < current.count ) {
        acc = current // get the hit with the highest count
      }
      return acc
    })
    if (mainRes && mainRes.count) {
      addGtagForEvent(props.GA_TRACKING_ID, 'Navnesøket', 'Søk', searchTerm)
    }
    setMainNameResult(mainRes)
  }

  const parseResultText = (doc) => {
    return (
      `${doc.count} 
      ${formatGender(doc.gender)} ${props.namePhrases.have}
      ${capitalizeNames(doc.name)}
      ${props.namePhrases.asTheir} ${translateName(doc.type)}`)
  }
  function formatGender(gender) {
    switch (gender) {
    case 'F':
      return props.namePhrases.women
    case 'M':
      return props.namePhrases.men
    default: return ''
    }
  }
  function translateName(nameCode) {
    return props.namePhrases.types[nameCode]
  }

  function renderNameResult() {
    if (mainNameResult && mainNameResult.count && !filterChanged && numberChanged === 0) {
      return (
        //  TODO: Legge til en bedre url til navnestatistikken
        <Card title={ mainNameResult && parseResultText(mainNameResult) } className={'pb-5'} href={'/navn'} icon={<User size={32} />}>
          {props.namePhrases.readMore}
        </Card>
      )
    } else return null
  }

  const dropdownContentTypeItems = [
    {
      id: 'allTypes',
      title: props.allContentTypesPhrase
    }
  ].concat(contentTypes.map((type) => {
    const phrase = props.contentTypePhrases.find((phrase) => phrase.id === type.title)
    return {
      id: type.title,
      title: `${phrase.title} (${type.count})`
    }
  }))

  const dropdownSubjectsItems = [
    {
      id: 'allSubjects',
      title: props.allContentTypesPhrase
    }
  ].concat(subjects.map((type) => {
    return {
      id: type.title,
      title: `${type.title} (${type.count})`
    }
  }))

  const DropdownMainSubject = React.forwardRef((_props, ref) => (
    <Dropdown
      ref={ref}
      className="DropdownMainSubject"
      id='mainSubject'
      onSelect={(value) => {
        onChange('mainSubject', value)
        addGtagForEvent(props.GA_TRACKING_ID, 'Valgt emne', 'Søk', value.title)
      }}
      selectedItem={selectedMainSubject}
      items={dropdownSubjectsItems}
      header={props.chooseSubjectPhrase}
    />
  ))

  const DropdownContentType = React.forwardRef((_props, ref) => (
    <Dropdown
      ref={ref}
      className="DropdownContentType"
      id='contentType'
      onSelect={(value) => {
        onChange('contentType', value)
        addGtagForEvent(props.GA_TRACKING_ID, 'Valgt innholdstype', 'Søk', value.title)
      }}
      selectedItem={selectedContentType}
      items={dropdownContentTypeItems}
      header={props.chooseContentTypePhrase}
    />
  ))

  function renderRadiobuttonSort() {
    return (
      <RadioGroup
        className='float-end'
        onChange={(value) => {
          onChangeSortList(value)
        }}
        selectedValue='best'
        orientation='row'
        items={[
          {
            label: props.sortBestHitPhrase,
            value: 'best'
          },
          {
            label: props.sortDatePhrase,
            value: 'publiseringsdato'
          }
        ]}
      />
    )
  }

  function renderFilterResults() {
    const limitResultPhrase = props.limitResultPhrase
    const filterDropdowns = (
      <Row justify-content-start>
        <Col lg='4' className='search-result-dropdown pb-1 pr-1'>
          <DropdownMainSubject/>
        </Col>
        <Col lg='4' className='search-result-dropdown pr-1'>
          <DropdownContentType/>
        </Col>
      </Row>
    )

    return (
      <div className="filter">
        {!mobile ?
          <React.Fragment>
            <span className="limit-result mb-3">{limitResultPhrase}</span>
            {filterDropdowns}
          </React.Fragment> :
          <Accordion
            id="search-result-filter-accordion"
            header={limitResultPhrase}
          >
            {filterDropdowns}
          </Accordion>
        }
        {renderClearFilterButton()}
      </div>
    )
  }

  function renderClearFilterButton() {
    if (filter.mainSubject || filter.contentType) {
      return (
        <Tag
          onClick={removeFilter}
          icon={<X size={18} />}
        >{props.removeFilterPhrase}
        </Tag>
      )
    }
  }

  return (
    <section className="search-result container-fluid p-0">
      <div className="row">
        <div className="col-12 search-result-head">
          <div className="container">
            <Title>{props.title}</Title>
            <Input
              size={!mobile && 'lg'}
              value={searchTerm}
              handleChange={setSearchTerm}
              searchField
              submitCallback={goToSearchResultPage}
              ariaLabelWrapper={props.term ? props.mainSearchPhrase : undefined}
              ariaLabelSearchButton={props.searchText}
            />
            {renderFilterResults()}
          </div>
        </div>
        <div className="col-12 search-result-body">
          <div className="container mt-5">
            {hits.length > 0 || props.bestBetHit ? renderList() : renderNoHitMessage()}
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
  nameSearchUrl: PropTypes.string,
  language: PropTypes.string,
  term: PropTypes.string,
  showingPhrase: PropTypes.string,
  limitResultPhrase: PropTypes.string,
  removeFilterPhrase: PropTypes.string,
  mainSearchPhrase: PropTypes.string,
  chooseSubjectPhrase: PropTypes.string,
  chooseContentTypePhrase: PropTypes.string,
  searchText: PropTypes.string,
  sortPhrase: PropTypes.string,
  sortBestHitPhrase: PropTypes.string,
  sortDatePhrase: PropTypes.string,
  allContentTypesPhrase: PropTypes.string,
  allSubjectsPhrase: PropTypes.string,
  count: PropTypes.number,
  noHitMessage: PropTypes.string,
  nameSearchToggle: PropTypes.bool,
  namePhrases: PropTypes.shape({
    readMore: PropTypes.string,
    thereAre: PropTypes.string,
    with: PropTypes.string,
    asTheir: PropTypes.string,
    have: PropTypes.string,
    threeOrLessText: PropTypes.string,
    women: PropTypes.string,
    men: PropTypes.string,
    types: PropTypes.shape({
      firstgivenandfamily: PropTypes.string,
      middleandfamily: PropTypes.string,
      family: PropTypes.string,
      onlygiven: PropTypes.string,
      onlygivenandfamily: PropTypes.string,
      firstgiven: PropTypes.string
    })
  }),
  bestBetHit: PropTypes.shape({
    title: PropTypes.string,
    url: PropTypes.string,
    preface: PropTypes.string,
    mainSubject: PropTypes.string,
    contentType: PropTypes.string,
    publishDate: PropTypes.string,
    publishDateHuman: PropTypes.string
  }),
  hits: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      url: PropTypes.string,
      preface: PropTypes.string,
      mainSubject: PropTypes.string,
      contentType: PropTypes.string,
      publishDate: PropTypes.string,
      publishDateHuman: PropTypes.string
    })),
  contentTypePhrases: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string
    })),
  contentTypes: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      count: PropTypes.number
    })),
  subjects: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      count: PropTypes.number
    })),
  GA_TRACKING_ID: PropTypes.string,
  contentTypeUrlParam: PropTypes.string,
  subjectUrlParam: PropTypes.string
}

export default (props) => <SearchResult {...props} />
