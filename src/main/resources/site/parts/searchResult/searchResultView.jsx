import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Card,
  Button,
  Divider,
  Input,
  Link,
  Paragraph,
  Title,
  Dropdown,
  Tag,
  RadioGroup } from '@statisticsnorway/ssb-component-library'
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
  const [filterChanged, setFilterChanged] = useState(false)
  const [nameSearchData, setNameSearchData] = useState(undefined)
  const [mainNameResult, setMainNameResult] = useState(undefined)
  const [sortChanged, setSortChanged] = useState(false)
  const [sortList, setSortList] = useState(undefined)
  const [filter, setFilter] = useState({
    mainSubject: '',
    contentType: ''
  })
  const [selectedMainSubject, setSelectedMainSubject] = useState(props.dropDownSubjects[0])
  const [selectedContentType, setSelectedContentType] = useState(props.dropDownContentTypes[0])
  const [contentTypeFacets, setContentTypeFacets] = useState(props.contentTypeFacets)
  const [numberChanged, setNumberChanged] = useState(0)

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

  function removeFilter() {
    setFilter({
      mainSubject: '',
      contentType: ''
    })
    setSelectedContentType(props.dropDownContentTypes[0])
    setSelectedMainSubject(props.dropDownSubjects[0])
    addGtagForEvent(props.GA_TRACKING_ID, 'Klikk', 'Søk', 'Fjern alle filtervalg')
  }

  function renderListItem(hit, i) {
    if (hit) {
      return (
        <li key={i ? i : undefined} className="mb-4">
          <Link href={hit.url} className="ssb-link header" onClick={() => {
            addGtagForEvent(props.GA_TRACKING_ID, 'Klikk på lenke', 'Søk', `${searchTerm} - Lenke nummer: ${i + 1}`)
          }}>
            <span dangerouslySetInnerHTML={{
              __html: hit.title.replace(/&nbsp;/g, ' ')
            }}></span>
          </Link>
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
    setLoading(true)
    axios.get(props.searchServiceUrl, {
      params: {
        sok: searchTerm,
        start: 0,
        count: props.count,
        language: props.language,
        mainsubject: filter.mainSubject,
        contentType: filter.contentType,
        sort: sortList === 'publiseringsdato' ? sortList : undefined
      }
    }).then((res) => {
      setHits(res.data.hits)
      setTotal(res.data.total)
      setContentTypes(res.data.contentTypes)
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
        contentType: filter.contentType,
        sort: sortList === 'publiseringsdato' ? sortList : undefined
      }
    }).then((res) => {
      setHits(hits.concat(res.data.hits))
      setTotal(res.data.total)
      setContentTypes(res.data.contentTypes)
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
            onClick={() => {
              fetchSearchResult()
              addGtagForEvent(props.GA_TRACKING_ID, 'Klikk', 'Søk', 'Vis flere')
            }}
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
    if (mainNameResult && mainNameResult.count) {
      return (
        //  TODO: Legge til en bedre url til navnestatistikken
        <Card title={ mainNameResult && parseResultText(mainNameResult) } className={'pb-5'} href={'/navn'} icon={<User size={32} />}>
          {props.namePhrases.readMore}
        </Card>
      )
    } else return null
  }

  // function getContentTypeFacets() {
  //   const validFilters = ['artikkel', 'statistikk', 'faktaside', 'statistikkbanktabell', 'publikasjon']
  //   const facetContentTypes = []
  //   contentTypes.forEach((facet, i) => {
  //     if (typeof facet == 'string') {
  //       const facetCount = contentTypes[i + 1]
  //       facetContentTypes.push({
  //         title: facet,
  //         count: +facetCount
  //       })
  //     }
  //   })
  //   return facetContentTypes.filter((value) => validFilters.includes(value.title ))
  // }

  const dropdownContentTypeItems = [
    {
      id: 'allTypes',
      title: props.allContentTypesPhrase,
      disabled: false
    }
  ].concat(contentTypeFacets.map((type) => {
    const phrase = props.contentTypePhrases.find((phrase) => phrase.id === type.title)
    return {
      id: type.title,
      title: `${phrase.title} (${type.count})`,
      disabled: false
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
      items={props.dropDownSubjects}
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
    <section className="search-result container-fluid p-0">
      <div className="row">
        <div className="col-12 search-result-head">
          <div className="container py-5">
            <Title>{props.title}</Title>
            <Input
              size="lg"
              value={searchTerm}
              handleChange={setSearchTerm}
              searchField
              submitCallback={goToSearchResultPage}
              ariaLabelWrapper={props.term ? props.mainSearchPhrase : undefined}
              ariaLabelSearchButton={props.searchText}
            />
            <div className="filter mt-5">
              <span className="limit-result mb-3">{props.limitResultPhrase}</span>
              <Row justify-content-start>
                <Col lg='4' className='pb-1 pr-1'>
                  <DropdownMainSubject/>
                </Col>
                <Col lg='4' className='pr-1'>
                  <DropdownContentType/>
                </Col>
              </Row>
              {renderClearFilterButton()}
            </div>
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
  dropDownSubjects: PropTypes.array,
  dropDownContentTypes: PropTypes.array,
  contentTypePhrases: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string
    })),
  contentTypeFacets: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      count: PropTypes.number
    })),
  contentTypes: PropTypes.array,
  GA_TRACKING_ID: PropTypes.string
}

export default (props) => <SearchResult {...props} />
