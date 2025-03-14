import React, { useState, useEffect, useRef } from 'react'
import {
  Card,
  Divider,
  Input,
  Link,
  Paragraph,
  Title,
  Dropdown,
  Tag,
  RadioGroup,
  Button,
} from '@statisticsnorway/ssb-component-library'
import { ChevronDown, User, X } from 'react-feather'
import axios from 'axios'
import { NumericFormat } from 'react-number-format'
import { Col, Row } from 'react-bootstrap'
import { sanitize } from '/lib/ssb/utils/htmlUtils'
import { NameSearchData, type SearchResultProps } from '/lib/types/partTypes/searchResult'
import { type DropdownItem } from '/lib/types/partTypes/publicationArchive'
import { type PreparedSearchResult } from '/lib/types/solr'
import { usePagination } from '/lib/ssb/utils/customHooks/paginationHooks'

function SearchResult(props: SearchResultProps) {
  const [hits, setHits] = useState(props.hits)
  const [searchTerm, setSearchTerm] = useState(props.term)
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(props.total)
  const [contentTypes, setContentTypes] = useState(props.contentTypes)
  const [subjects, setSubjects] = useState(props.subjects)
  const [filterChanged, setFilterChanged] = useState<string | boolean>(false)
  const [sortChanged, setSortChanged] = useState(false)
  const [sortList, setSortList] = useState<string | undefined>(undefined)
  const [filter, setFilter] = useState({
    mainSubject: props.subjectUrlParam ?? '',
    contentType: props.contentTypeUrlParam ?? '',
  })
  const [reset, setReset] = useState(0)
  const [searchResultSRText, setSearchResultSRText] = useState<null | string>(null)
  const allContentTypeItem = {
    id: 'allTypes',
    title: props.allContentTypesPhrase,
  }

  const preselectedContentType = props.contentTypeUrlParam
    ? props.contentTypePhrases.find((phrase) => phrase.id === props.contentTypeUrlParam)
    : undefined

  const preselectedContentTypeDropdownItem = preselectedContentType
    ? {
        id: props.contentTypeUrlParam,
        title: preselectedContentType.title,
      }
    : allContentTypeItem
  const allSubjectsItem = {
    id: 'allSubjects',
    title: props.allSubjectsPhrase,
  }
  const preselectedSubjectDropdownItem = props.subjectUrlParam
    ? {
        id: props.subjectUrlParam,
        title: props.subjectUrlParam,
      }
    : allSubjectsItem
  const [selectedContentType, setSelectedContentType] = useState(preselectedContentTypeDropdownItem)
  const [selectedMainSubject, setSelectedMainSubject] = useState(preselectedSubjectDropdownItem)
  const [numberChanged, setNumberChanged] = useState(0)
  const [openAccordion, setOpenAccordion] = useState(false)
  const inputSearchElement = useRef<HTMLDivElement>(null)

  const ADDITIONAL_HITS_LENGTH = 15
  const { disableBtn, getCurrentElementRef, handleKeyboardNavigation, handleOnClick } = usePagination({
    list: hits,
    listItemsPerPage: ADDITIONAL_HITS_LENGTH,
    loading,
    onLoadMore: () => onShowMoreSearchResults(),
    totalCount: total,
  })

  useEffect(() => {
    if (searchTerm && inputSearchElement.current) {
      ;(inputSearchElement.current.firstChild as HTMLInputElement)?.focus()
    }

    const announceSearchResultScreenReader = setTimeout(() => {
      setSearchResultSRText(props.searchResultSRText)
    }, 1500)
    const clearSearchResulScreenReaderText = setTimeout(() => {
      setSearchResultSRText(null)
    }, 2000)
    return () => {
      clearTimeout(announceSearchResultScreenReader)
      clearTimeout(clearSearchResulScreenReaderText)
    }
  }, [])

  useEffect(() => {
    if (filterChanged || sortChanged) {
      fetchFilteredSearchResult()
    }
  }, [filter, sortList])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onChange(id: string, value: any) {
    setFilterChanged(id)

    if (id === 'mainSubject') {
      setSelectedMainSubject(value)
      setFilter({
        ...filter,
        mainSubject: value.id === '' || value.id === 'allSubjects' ? '' : value.id,
      })
    }

    if (id === 'contentType') {
      setSelectedContentType(value)
      setFilter({
        ...filter,
        contentType: value.id === '' || value.id === 'allTypes' ? '' : value.id,
      })
    }
  }

  function onChangeSortList(value: string) {
    setSortChanged(true)
    setSortList(value)

    if (sortChanged) {
      setNumberChanged((prev) => prev + 1)
    }
  }

  function onShowMoreSearchResults() {
    fetchSearchResult()
  }

  function removeFilter() {
    setFilter({
      mainSubject: '',
      contentType: '',
    })
    setReset(reset + 1)
    setSelectedContentType(allContentTypeItem)
    setSelectedMainSubject(allSubjectsItem)
    setFilterChanged(true) // we want the useEffect to trigger fetching of results, and new filters
  }

  function renderListItem(hit: PreparedSearchResult, i?: number) {
    if (hit) {
      return (
        <li key={hit.id ?? i ?? undefined} className='mb-4'>
          <Link
            ref={getCurrentElementRef(i as number)}
            // deepcode ignore DOMXSS: url comes from pageUrl which escapes  + Reacts own escaping
            href={hit.url}
            linkType='header'
            headingSize={2}
          >
            <span
              dangerouslySetInnerHTML={{
                __html: sanitize(hit.title.replace(/&nbsp;/g, ' ')),
              }}
            ></span>
          </Link>
          <Paragraph className='search-result-ingress my-1'>
            <span
              dangerouslySetInnerHTML={{
                __html: sanitize(hit.preface.replace(/&nbsp;/g, ' ')),
              }}
            ></span>
          </Paragraph>
          <Paragraph className='metadata'>
            <span className='type'>{hit.contentType}</span>{' '}
            {((hit.contentType && hit.publishDateHuman) || (hit.contentType && hit.mainSubject)) && ` / `}
            <time dateTime={hit.publishDate}>{hit.publishDateHuman}</time>{' '}
            {hit.publishDateHuman && hit.mainSubject && ` / `}
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
        <div className='row mb-4'>
          <Col className='total-hits col-12 col-md-4' aria-live='polite' aria-atomic='true'>
            {props.showingPhrase.replace('{0}', currentAmount)}&nbsp;
            <NumericFormat value={Number(totalHits)} displayType='text' thousandSeparator=' ' />
          </Col>
          <Col className='choose-sorting col-12 col-md-8'>
            <span className='sort-title'>{`${props.sortPhrase}:`}</span>
            <RadioGroup
              className='float-end'
              onChange={(value: string) => {
                onChangeSortList(value)
              }}
              selectedValue='best'
              orientation='row'
              items={[
                {
                  label: props.sortBestHitPhrase,
                  value: 'best',
                },
                {
                  label: props.sortDatePhrase,
                  value: 'publiseringsdato',
                },
              ]}
            />
          </Col>
          <Divider dark />
        </div>
        {props.nameSearchData ? renderNameResult() : undefined}
        <ol className='list-unstyled '>
          {renderListItem(bestBetHit!)}
          {hits.map((hit, i) => {
            return renderListItem(hit, i)
          })}
        </ol>
      </div>
    )
  }

  function renderLoading() {
    if (loading) {
      return (
        <div className='row'>
          <div className='col'>
            <span className='spinner-border spinner-border' />
          </div>
        </div>
      )
    }
  }

  function fetchFilteredSearchResult() {
    const mainSubject = filter.mainSubject
    const contentType = filter.contentType

    setLoading(true)
    axios
      .get(props.searchServiceUrl, {
        params: {
          sok: searchTerm,
          start: 0,
          count: props.count,
          language: props.language,
          mainsubject: mainSubject,
          contentType: contentType,
          sort: sortList === 'publiseringsdato' ? sortList : undefined,
        },
      })
      .then((res) => {
        setHits(res.data.hits)
        setTotal(res.data.total)
        if (filterChanged) setContentTypes(res.data.contentTypes)
        if (filterChanged) setSubjects(res.data.subjects)
      })
      .finally(() => {
        setLoading(false)
        const mainSubjectQueryString = mainSubject ? `&emne=${mainSubject}` : ''
        const contentTypeQueryString = contentType ? `&innholdstype=${contentType}` : ''
        window.history.pushState({}, '', `?sok=${searchTerm}${mainSubjectQueryString}${contentTypeQueryString}`)
        setFilterChanged(false)
      })
  }

  function fetchSearchResult() {
    setLoading(true)
    axios
      .get(props.searchServiceUrl, {
        params: {
          sok: searchTerm,
          start: hits.length,
          count: props.count,
          language: props.language,
          mainsubject: filter.mainSubject,
          contentType: filter.contentType,
          sort: sortList === 'publiseringsdato' ? sortList : undefined,
        },
      })
      .then((res) => {
        setHits(hits.concat(res.data.hits))
        setTotal(res.data.total)
        setContentTypes(res.data.contentTypes)
        setSubjects(res.data.subjects)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  function renderShowMoreButton() {
    if (hits.length > 0) {
      return (
        <div>
          <Button
            disabled={disableBtn}
            className='button-more mt-5'
            onClick={handleOnClick}
            onKeyDown={handleKeyboardNavigation}
          >
            <ChevronDown size='18' /> {props.buttonTitle}
          </Button>
        </div>
      )
    }
    return null
  }

  function renderNoHitMessage() {
    if (props.language === 'en') {
      return (
        <div>
          {renderNameResult()}
          <Title size={2}>{props.noHitMessage}</Title>
          <p>
            Go to <Link href='/en/navn'>name search</Link>
          </p>
          <p>
            See <Link href='/en/publiseringsarkiv'>list of all our published statistics, analyses and articles </Link>
          </p>
          <p>
            Go to <Link href='/en/statbank'>Statbank</Link> to find all our figures and tables
          </p>
        </div>
      )
    } else {
      return (
        <div>
          {renderNameResult()}
          <Title size={2}>{props.noHitMessage}</Title>
          <p>
            Her finner du <Link href='/navn'>navnesøk</Link>
          </p>
          <p>
            Her finner du{' '}
            <Link href='/publiseringsarkiv'>liste over alle publiserte statistikker, analyser og artikler </Link>
          </p>
          <p>
            I verktøyet <Link href='/statbank'>Statistikkbanken</Link> finner du alle tallene våre
          </p>
        </div>
      )
    }
  }

  function goToSearchResultPage() {
    // deepcode ignore OR: pageUrl and content._path is used to generate the URL in the backend
    window.location.href = `${props.searchPageUrl}?sok=${searchTerm}`
  }

  function capitalizeNames(name: string) {
    const nameTokens = name.toLowerCase().split(' ')
    const capitalizedTokens = nameTokens.map((n) => {
      const first = n.slice(0, 1).toUpperCase()
      const rest = n.slice(1)
      return first + rest
    })
    return capitalizedTokens.join(' ')
  }

  const parseResultText = (doc: NameSearchData) => {
    return `${doc.count}
      ${formatGender(doc.gender)} ${props.namePhrases.have}
      ${capitalizeNames(doc.name)}
      ${props.namePhrases.asTheir} ${translateName(doc.type)}`
  }
  function formatGender(gender: string) {
    switch (gender) {
      case 'F':
        return props.namePhrases.women
      case 'M':
        return props.namePhrases.men
      default:
        return ''
    }
  }
  function translateName(nameCode: string) {
    return props.namePhrases.types[nameCode]
  }

  function renderNameResult() {
    const mainNameResult = props.nameSearchData
    if (mainNameResult?.count && !filterChanged && numberChanged === 0) {
      return (
        //  TODO: Legge til en bedre url til navnestatistikken
        <Card
          title={mainNameResult && parseResultText(mainNameResult)}
          className={'pb-5'}
          href={'/navn'}
          icon={<User size={32} />}
        >
          {props.namePhrases.readMore}
        </Card>
      )
    } else return null
  }

  const dropdownContentTypeItems = React.useMemo(() => {
    return [
      {
        id: 'allTypes',
        title: props.allContentTypesPhrase,
      },
    ].concat(
      contentTypes.map((type) => {
        const phrase = props.contentTypePhrases.find((phrase) => phrase.id === type.title)
        return {
          id: type.title,
          title: `${phrase?.title} (${type.count})`,
        }
      })
    )
  }, [contentTypes])

  const dropdownSubjectsItems = React.useMemo(() => {
    return [
      {
        id: 'allSubjects',
        title: props.allSubjectsPhrase,
      },
    ].concat(
      subjects.map((type) => {
        return {
          id: type.title,
          title: `${type.title} (${type.count})`,
        }
      })
    )
  }, [subjects])

  const limitResultPhrase = props.limitResultPhrase

  return (
    <section className='search-result container-fluid p-0'>
      <div className='col-12 search-result-head'>
        <div className='container'>
          <Title>{props.title}</Title>
          <Input
            ref={inputSearchElement}
            className='d-none d-lg-block'
            size='lg'
            value={searchTerm}
            handleChange={setSearchTerm}
            searchField
            submitCallback={goToSearchResultPage}
            ariaLabel={props.mainSearchPhrase}
            ariaLabelWrapper={props.term ? props.mainSearchPhrase : undefined}
            ariaLabelSearchButton={props.searchText}
          />
          <Input
            className='d-block d-lg-none'
            value={searchTerm}
            handleChange={setSearchTerm}
            searchField
            submitCallback={goToSearchResultPage}
            ariaLabel={props.mainSearchPhrase}
            ariaLabelWrapper={props.term ? props.mainSearchPhrase : undefined}
            ariaLabelSearchButton={props.searchText}
          />
          <div className='filter'>
            <span className='limit-result mb-3'>{limitResultPhrase}</span>
            <Row>
              <Col lg='4' className='search-result-dropdown pb-1 pr-1'>
                <Dropdown
                  className='DropdownMainSubject'
                  id='mainSubject'
                  key={`mainSubject-${reset}`}
                  onSelect={(value: DropdownItem) => {
                    onChange('mainSubject', value)
                    if (!openAccordion) {
                      setOpenAccordion(true)
                    }
                  }}
                  selectedItem={selectedMainSubject}
                  items={dropdownSubjectsItems}
                  header={props.chooseSubjectPhrase}
                />
              </Col>
              <Col lg='4' className='search-result-dropdown pr-1'>
                <Dropdown
                  className='DropdownContentType'
                  id='contentType'
                  key={`contentType-${reset}`}
                  onSelect={(value: DropdownItem) => {
                    onChange('contentType', value)
                    if (!openAccordion) {
                      setOpenAccordion(true)
                    }
                  }}
                  selectedItem={selectedContentType}
                  items={dropdownContentTypeItems}
                  header={props.chooseContentTypePhrase}
                />
              </Col>
            </Row>
            {(filter.mainSubject || filter.contentType) && (
              <Tag onClick={removeFilter} icon={<X size={18} />}>
                {props.removeFilterPhrase}
              </Tag>
            )}
          </div>
        </div>
      </div>
      <div className='col-12 search-result-body'>
        <div className='container mt-5'>
          {searchResultSRText && (
            <div className='visually-hidden' aria-live='polite'>
              {searchResultSRText}
            </div>
          )}
          {hits.length > 0 || props.bestBetHit ? renderList() : renderNoHitMessage()}
          {renderLoading()}
          {renderShowMoreButton()}
        </div>
      </div>
    </section>
  )
}

export default (props: SearchResultProps) => <SearchResult {...props} />
