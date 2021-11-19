import React, { useEffect, useState } from 'react'
import { Button, Divider, Link, Title, Text, Dropdown } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import Truncate from 'react-truncate'
import NumberFormat from 'react-number-format'
import { ChevronDown } from 'react-feather'
import axios from 'axios'

function PublicationArchive(props) {
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
    dropDownTypes
  } = props
  const [publications, setPublications] = useState(firstPublications.publications)
  const [total, setTotal] = useState(firstPublications.total)
  const [loading, setLoading] = useState(false)
  const [first, setFirst] = useState(true)
  const [filterChanged, setFilterChanged] = useState(false)
  const [filter, setFilter] = useState({
    mainSubject: '',
    articleType: ''
  })

  useEffect(() => {
    if (first) {
      setFirst(false)
      setPublications(publications)
    }
    if (filterChanged) {
      fetchPublicationsFiltered()
    }
  }, [filter])

  function onChange(id, value) {
    setFilterChanged(true)
    if (id === 'articleType') {
      setFilter({
        ...filter,
        articleType: value.id
      })
    }
    if (id === 'mainSubject') {
      setFilter({
        ...filter,
        mainSubject: value.id
      })
    }
  }

  function fetchPublicationsFiltered() {
    setLoading(true)
    axios.get(publicationArchiveServiceUrl, {
      params: {
        start: 0,
        count: 10,
        language: language,
        subject: filter.mainSubject,
        type: filter.articleType
      }
    }).then((res) => {
      setPublications(res.data.publications)
      setTotal(res.data.total)
    }).finally(() => {
      setLoading(false)
    })
  }

  function fetchPublications() {
    setLoading(true)
    axios.get(publicationArchiveServiceUrl, {
      params: {
        start: publications.length,
        count: 10,
        language: language,
        subject: filter.mainSubject,
        type: filter.articleType
      }
    }).then((res) => {
      setPublications(publications.concat(res.data.publications))
      setTotal(res.data.total)
    }).finally(() => {
      setLoading(false)
    })
  }

  function renderPublications() {
    return publications.map((publication, i) => {
      return (
        <div key={i} className="row mb-5">
          <div className="col">
            <Link href={publication.url} className="ssb-link header">
              {publication.title}
            </Link>
            {publication.period && <p className="mt-1 mb-0">{publication.period}</p>}
            <p className="my-1">
              <Truncate lines={2}>
                {publication.preface}
              </Truncate>
            </p>
            <Text small>
              {getArticleType(publication)} /&nbsp;
              <time dateTime={publication.publishDate}>{publication.publishDateHuman}</time>
              {publication.mainSubject && `/ ${publication.mainSubject}`}
            </Text>
          </div>
        </div>
      )
    })
  }

  function getArticleType(publication) {
    return articleTypePhrases[publication.articleType]
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

  function renderFilter() {
    return (
      <div className="mt-5">
        <div className="row">
          <div className="col">
            <Title size={6}>{defineContentPhrase}</Title>
          </div>
        </div>
        <div className="row">
          <div className="col-12 col-md-4">
            {addDropdownSubject('mainSubject')}
          </div>
          <div className="col-12 col-md-4 mt-3 mt-md-0">
            {addDropdownArticleType('articleType')}
          </div>
        </div>
      </div>

    )
  }

  function addDropdownSubject(id) {
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

  function addDropdownArticleType(id) {
    return (
      <Dropdown
        className="contentType"
        id={id}
        onSelect={(value) => {
          onChange(id, value)
        }}
        selectedItem={dropDownTypes[0]}
        items={dropDownTypes}
      />
    )
  }

  function addHiddenLinkSolrArticleList() {
    const solrArticleListUrl = `/_/service/mimir/solrArticleList?language=${props.language}`
    return (
      <div style={{
        display: 'none'
      }}>
        <Link tabIndex="-1" href={solrArticleListUrl}>Alle artikler</Link>
      </div>
    )
  }

  return (
    <section className="publication-archive container-fluid">
      <div className="row">
        <div className="col-12 publication-archive-head py-5 px-2">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <Title>{title}</Title>
                <div className="publication-archive-ingress" dangerouslySetInnerHTML={{
                  __html: ingress.replace(/&nbsp;/g, ' ')
                }}>
                </div>
                {renderFilter()}
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 publication-archive-body mt-5">
          <div className="container mb-5">
            <div className="row">
              <div className="col">
                {showingPhrase.replace('{0}', publications.length)}&nbsp;<NumberFormat
                  value={ Number(total) }
                  displayType={'text'}
                  thousandSeparator={' '}/>
                <Divider className="mb-4" dark></Divider>
              </div>
            </div>
            {renderPublications()}
            {renderLoading()}
            <div>
              <Button
                disabled={loading || total === publications.length}
                className="button-more mt-5"
                onClick={fetchPublications}
              >
                <ChevronDown size="18"/> {buttonTitle}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {addHiddenLinkSolrArticleList()}
    </section>
  )
}

export default (props) => <PublicationArchive {...props} />

PublicationArchive.propTypes = {
  title: PropTypes.string,
  ingress: PropTypes.string,
  buttonTitle: PropTypes.string,
  showingPhrase: PropTypes.string,
  defineContentPhrase: PropTypes.string,
  language: PropTypes.string,
  publicationArchiveServiceUrl: PropTypes.string,
  firstPublications: PropTypes.objectOf({
    total: PropTypes.number,
    publications: PropTypes.array
  }),
  articleTypePhrases: PropTypes.objectOf(PropTypes.string),
  dropDownSubjects: PropTypes.array,
  dropDownTypes: PropTypes.array

}
