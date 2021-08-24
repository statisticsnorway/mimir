import React, { useEffect, useState } from 'react'
import { Button, Divider, Link, Title } from '@statisticsnorway/ssb-component-library'
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
    statisticsReleases,
    language,
    articleTypePhrases,
    showingPhrase
  } = props
  const [publications, setPublications] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [first, setFirst] = useState(true)

  useEffect(() => {
    if (first) {
      setFirst(false)
      fetchPublications()
    }
  })

  function fetchPublications() {
    setLoading(true)
    axios.get(publicationArchiveServiceUrl, {
      params: {
        start: publications.length,
        count: 10,
        language: language
      }
    }).then((res) => {
      setPublications(publications.concat(res.data.publications, statisticsReleases).sort((a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()))
      setTotal(res.data.total + statisticsReleases.length)
    }).finally(() => {
      setLoading(false)
    })
  }

  function renderPublications() {
    return publications.map((publication, i) => {
      console.log(publication)
      return (
        <div key={i} className="row mb-5">
          <div className="col">
            <Link href={publication.url} className="ssb-link header">
              {publication.title}
            </Link>
            <p>
              <Truncate lines={2}>
                {publication.period && <span>{publication.period}<br/></span>}
                {publication.preface}
              </Truncate>
            </p>
            <span>
              {getArticleType(publication)} /&nbsp;
              <time dateTime={publication.publishDate}>{publication.publishDateHuman}</time> /&nbsp;
              {publication.mainSubject}</span>
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
    </section>
  )
}

export default (props) => <PublicationArchive {...props} />

PublicationArchive.propTypes = {
  title: PropTypes.string,
  ingress: PropTypes.string,
  buttonTitle: PropTypes.string,
  showingPhrase: PropTypes.string,
  language: PropTypes.string,
  publicationArchiveServiceUrl: PropTypes.string,
  statisticsReleases: PropTypes.array,
  articleTypePhrases: PropTypes.objectOf(PropTypes.string)
}
