import React, { useEffect, useRef, useState } from 'react'
import { Button, Divider, Link, Title, Text, Dropdown } from '@statisticsnorway/ssb-component-library'
import { NumericFormat } from 'react-number-format'
import { ChevronDown } from 'react-feather'
import axios from 'axios'
import { sanitize } from '../../../lib/ssb/utils/htmlUtils'
import {
  type DropdownItem,
  type PublicationArchiveProps,
  type PublicationItem,
} from '../../../lib/types/partTypes/publicationArchive'

function PublicationArchive(props: PublicationArchiveProps) {
  const {
    title,
    ingress,
    buttonTitle,
    publicationArchiveServiceUrl,
    firstPublications,
    language,
    articleTypePhrases,
    showingPhrase,
    defineContentPhrase,
    dropDownSubjects,
    dropDownTypes,
  } = props
  const [publications, setPublications] = useState(firstPublications.publications)
  const [total, setTotal] = useState(firstPublications.total)
  const [loading, setLoading] = useState(false)
  const [first, setFirst] = useState(true)
  const [filterChanged, setFilterChanged] = useState(false)
  const [filter, setFilter] = useState({
    mainSubject: '',
    articleType: '',
  })
  const [keyboardNavigation, setKeyboardNavigation] = useState(false)

  const currentElement = useRef<HTMLAnchorElement>(null)
  const ADDITIONAL_PUBLICATIONS_LENGTH = 10

  useEffect(() => {
    if (first) {
      setFirst(false)
    }
    if (filterChanged) {
      fetchPublicationsFiltered()
    }
  }, [filter])

  useEffect(() => {
    if (keyboardNavigation) {
      currentElement.current?.focus()
    }
  }, [publications])

  function onChange(id: string, value: DropdownItem) {
    setFilterChanged(true)
    if (id === 'articleType') {
      setFilter({
        ...filter,
        articleType: value.id,
      })
    }
    if (id === 'mainSubject') {
      setFilter({
        ...filter,
        mainSubject: value.id,
      })
    }
  }

  function fetchPublicationsFiltered() {
    setLoading(true)
    axios
      .get(publicationArchiveServiceUrl, {
        params: {
          start: 0,
          count: 10,
          language: language,
          subject: filter.mainSubject,
          type: filter.articleType,
        },
      })
      .then((res) => {
        setPublications(res.data.publications)
        setTotal(res.data.total)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  function fetchPublications() {
    setLoading(true)
    axios
      .get(publicationArchiveServiceUrl, {
        params: {
          start: publications.length,
          count: 10,
          language: language,
          subject: filter.mainSubject,
          type: filter.articleType,
        },
      })
      .then((res) => {
        setPublications(publications.concat(res.data.publications))
        setTotal(res.data.total)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  function renderPublications() {
    return publications.map((publication, i) => {
      return (
        <div key={i} className='row mb-5'>
          <div className='col'>
            <Link
              ref={i === publications.length - ADDITIONAL_PUBLICATIONS_LENGTH ? currentElement : null}
              href={publication.url}
              linkType='header'
              headingSize={2}
            >
              {publication.title}
            </Link>

            {publication.period && <p className='mt-1 mb-0'>{publication.period}</p>}
            <p className='my-1 truncate-2-lines'>{publication.preface}</p>
            <Text small>
              {getArticleType(publication)} /&nbsp;
              <time dateTime={publication.publishDate}>{publication.publishDateHuman}</time>
              {publication.mainSubject && ` / ${publication.mainSubject}`}
            </Text>
          </div>
        </div>
      )
    })
  }

  function getArticleType(publication: PublicationItem) {
    return articleTypePhrases[publication.articleType]
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

  function renderFilter() {
    return (
      <div className='mt-5'>
        <div className='row'>
          <div className='col '>
            <p className='defineContentPhrase'>{defineContentPhrase}</p>
          </div>
        </div>
        <div className='row'>
          <div className='col-12 col-md-4'>{addDropdownSubject('mainSubject')}</div>
          <div className='col-12 col-md-4 mt-3 mt-md-0'>{addDropdownArticleType('articleType')}</div>
        </div>
      </div>
    )
  }

  function addDropdownSubject(id: string) {
    return (
      <Dropdown
        className='mainSubject'
        id={id}
        onSelect={(value: DropdownItem) => {
          onChange(id, value)
        }}
        selectedItem={dropDownSubjects[0]}
        items={dropDownSubjects}
        header={props.chooseSubjectPhrase}
      />
    )
  }

  function addDropdownArticleType(id: string) {
    return (
      <Dropdown
        className='contentType'
        id={id}
        onSelect={(value: DropdownItem) => {
          onChange(id, value)
        }}
        selectedItem={dropDownTypes[0]}
        items={dropDownTypes}
        header={props.chooseContentTypePhrase}
      />
    )
  }

  function addHiddenLinkSolrArticleList() {
    const language = props.language === 'en' ? 'en' : 'no'
    const solrArticleListUrl = `/_/service/mimir/solrArticleList?language=${language}`
    return (
      <div
        style={{
          display: 'none',
        }}
      >
        <Link tabIndex='-1' href={solrArticleListUrl}>
          Alle artikler
        </Link>
      </div>
    )
  }

  return (
    <section className='publication-archive container-fluid'>
      <div className='publication-archive-head'>
        <div className='container py-5'>
          <Title>{title}</Title>
          <div
            className='publication-archive-ingress'
            dangerouslySetInnerHTML={{
              __html: sanitize(ingress.replace(/&nbsp;/g, ' ')),
            }}
          ></div>
          {renderFilter()}
        </div>
      </div>

      <div className='col-12 publication-archive-body mt-5'>
        <div className='container mb-5'>
          <div className='row'>
            <div className='col'>
              {showingPhrase.replace('{0}', publications.length.toString())}&nbsp;
              <NumericFormat value={Number(total)} displayType='text' thousandSeparator=' ' />
              <Divider className='mb-4' dark></Divider>
            </div>
          </div>
          {renderPublications()}
          {renderLoading()}
          <div>
            <Button
              disabled={loading || total === publications.length}
              className='button-more mt-5'
              onClick={() => {
                setKeyboardNavigation(false)
                fetchPublications()
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setKeyboardNavigation(true)
                  fetchPublications()
                }
              }}
            >
              <ChevronDown size='18' /> {buttonTitle}
            </Button>
          </div>
        </div>
      </div>
      {addHiddenLinkSolrArticleList()}
    </section>
  )
}

export default (props: PublicationArchiveProps) => <PublicationArchive {...props} />
