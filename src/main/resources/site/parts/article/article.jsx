import React from 'react'
import { Link } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

function Article(props) {
  function renderTitleIngress() {
    const {
      introTitle, title, ingress
    } = props

    return (
      <div className="title-ingress-wrapper">
        {introTitle && <p className="introTitle">{introTitle}</p>}
        <h1 className="col-lg-10">{title}</h1>
        {ingress && <p className="ingress col-lg-8">{ingress}</p>}
      </div>
    )
  }

  function renderSNRDates() {
    const {
      serialNumber, phrases, showPubDate, pubDate, modifiedDate
    } = props

    return (
      <div className="row p-0">
        {serialNumber && <p className="font-weight-bold">{serialNumber}</p>}
        {showPubDate && <p><span className="font-weight-bold mr-1">{phrases.published}:</span>{pubDate}</p>}
        {modifiedDate && <p><span className="font-weight-bold mr-1">{phrases.modified}:</span>{modifiedDate}</p>}
      </div>
    )
  }

  function renderAuthors() {
    const {
      authors, phrases
    } = props

    if (authors.length) {
      return (
        <div className="row p-0">
          <p className="mr-1">{phrases.author}:</p>
          {authors.map((author, index) => {
            return (
              <>
                <Link key={`author-${index}`} href={author.email}>{author.name}</Link> {index < author.length - 1 ? ',' : ''}
              </>
            )
          })}
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
        <div className="col-10 col-md-12">
          <div className="article-body"
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
      associatedStatistics, phrases
    } = props

    if (associatedStatistics.length) {
      return (
        <div className="part-associated-statistics">
          <h3>{phrases.associatedStatisticsHeader}</h3>
          {associatedStatistics.map((associatedStatistic, index) => {
            return (
              <Link key={`associated-statistic-${index}`} href={associatedStatistic.href}>{associatedStatistic.text}</Link>
            )
          })}
        </div>
      )
    }
  }

  function renderAssociatedArticleArchives() {
    const {
      associatedArticleArchives, phrases
    } = props

    if (associatedArticleArchives.length) {
      return (
        <div className="part-associated-article-archives">
          <h3>{phrases.associatedArticleArchivesHeader}</h3>
          {associatedArticleArchives.map((associatedArticleArchive, index) => {
            return (
              <Link key={`associated-article-archive-${index}`} href={associatedArticleArchive.href}>{associatedArticleArchive.text}</Link>
            )
          })}
        </div>
      )
    }
  }

  function renderISBN() {
    const {
      isbn
    } = props

    if (isbn) {
      return (
        <div className="col-12 p-0 mt-4">
          <p className="text-center">
            <span className="font-weight-bold">ISBN (elektronisk): </span> {isbn}
          </p>
        </div>
      )
    }
  }

  return (
    <section className="xp-part article container-fluid">
      <div className="row">
        <div className="col-12 offset-lg-1 p-0">
          {renderTitleIngress()}
        </div>
        <div className="col-12 p-0">
          <div className="snr-dates-wrapper">
            {renderSNRDates()}
          </div>
          <div className="author-wrapper">
            {renderAuthors()}
          </div>
        </div>
        <div className="col-12 p-0">
          <div className="row">
            {renderArticleBody()}
            <div className="col associated-links-wrapper">
              {renderAssociatedStatistics()}
              {renderAssociatedArticleArchives()}
            </div>
          </div>
        </div>
        {renderISBN()}
      </div>
    </section>
  )
}

Article.propTypes = {
  introTitle: PropTypes.string,
  title: PropTypes.string,
  ingress: PropTypes.string,
  phrases: PropTypes.object,
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
