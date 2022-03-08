import React from 'react'
import { Title, Link, Divider } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

function Article(props) {
  const phrases = props.phrases

  function renderTitleIngress() {
    const {
      introTitle, title, ingress
    } = props

    return (
      <div className="title-ingress-wrapper col-12 col-lg-8 p-0">
        {introTitle && <p className="introTitle">{introTitle}</p>}
        <Title size={1} className="searchabletext">{title}</Title>
        {ingress && <p className="ingress searchabletext">{ingress}</p>}
      </div>
    )
  }

  function renderSNRDates() {
    const {
      serialNumber, showPubDate, pubDate, modifiedDate
    } = props

    return (
      <div className="snr-dates-wrapper col-12 col-lg-8 p-0">
        {serialNumber && <p className="fw-bold">{serialNumber}</p>}
        {showPubDate && <p><span className="fw-bold">{phrases.published}:</span>{` ${pubDate}`}</p>}
        {modifiedDate && <p><span className="fw-bold">{phrases.modified}:</span>{` ${modifiedDate}`}</p>}
      </div>
    )
  }

  function renderAuthors() {
    const {
      authors
    } = props

    if (authors) {
      return (
        <div className="author-wrapper col-12 col-lg-8 p-0">
          <p>
            <span className="mr-1">{`${phrases.author}: `}</span>
            {authors.map((author, index) => {
              return (
                <span key={`author-${index}`}>
                  <Link href={`mailto:${author.email}`}>{author.name}</Link>{index < authors.length - 1 ? ', ' : ''}
                </span>
              )
            })}
          </p>
        </div>
      )
    }
  }

  function renderArticleBody() {
    const {
      bodyText
    } = props

    if (bodyText) {
      return (
        <div className="col-lg-8 p-0">
          <div className="article-body searchabletext"
            dangerouslySetInnerHTML={{
              __html: bodyText
            }}
          />
        </div>
      )
    }
  }

  function renderAssociatedStatistics() {
    const {
      associatedStatistics
    } = props

    if (associatedStatistics.length) {
      return (
        <div className="associated-statistics mt-lg-0">
          <Title size={3}>{phrases.associatedStatisticsHeader}</Title>
          <div>
            {associatedStatistics.map((associatedStatistic, index) => {
              return (
                <div key={`associated-statistic-${index}`} className="col-12 p-0">
                  <Link href={associatedStatistic.href}>{associatedStatistic.text}</Link>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
  }

  function renderAssociatedArticleArchives() {
    const {
      associatedArticleArchives, associatedStatistics
    } = props

    if (associatedArticleArchives.length) {
      return (
        <div className={`associated-article-archives ${!associatedStatistics.length ? 'mt-lg-0' : ''}`}>
          <Title size={3}>{phrases.associatedArticleArchivesHeader}</Title>
          <div>
            {associatedArticleArchives.map((associatedArticleArchive, index) => {
              return (
                <div key={`associated-article-archive-${index}`} className="col-12 p-0">
                  <Link href={associatedArticleArchive.href}>{associatedArticleArchive.text}</Link>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
  }

  function renderISBN(mobile) {
    const {
      isbn
    } = props

    if (isbn) {
      return (
        <div className={`col-12 p-0 article-isbn ${mobile ? 'd-flex d-lg-none' : 'd-none justify-content-center d-lg-flex'} `}>
          <span className="fw-bold mr-1">{phrases.isbnElectronic}:</span>{isbn}
        </div>
      )
    }
  }

  return (
    <section className="xp-part article container p-0 mb-5">
      <div className="row">
        <div className="col-12 offset-lg-1 p-0">
          <div className="container row p-0">
            {renderTitleIngress()}
            {renderSNRDates()}
            {renderAuthors()}
            {renderArticleBody()}
            {renderISBN(true)}
            {(props.associatedStatistics || props.associatedArticleArchives) &&
            <div className="col-lg-3 p-0">
              <Divider className="d-flex d-lg-none" />
              {renderAssociatedStatistics()}
              {renderAssociatedArticleArchives()}
            </div>
            }
          </div>
        </div>
        {renderISBN(false)}
      </div>
    </section>
  )
}

Article.propTypes = {
  phrases: PropTypes.object,
  introTitle: PropTypes.string,
  title: PropTypes.string,
  ingress: PropTypes.string,
  serialNumber: PropTypes.string,
  showPubDate: PropTypes.string,
  pubDate: PropTypes.string,
  modifiedDate: PropTypes.string,
  authors: PropTypes.arrayOf(
    PropTypes.shape({
      email: PropTypes.string,
      name: PropTypes.string
    })
  ),
  bodyText: PropTypes.string,
  associatedStatistics: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
      href: PropTypes.string
    })
  ),
  associatedArticleArchives: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
      href: PropTypes.string
    })
  ),
  isbn: PropTypes.string
}

export default (props) => <Article {...props} />
