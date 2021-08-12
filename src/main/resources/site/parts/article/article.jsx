import React from 'react'
import { Title, Link, Divider } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

function Article(props) {
  function renderTitleIngress() {
    const {
      introTitle, title, ingress
    } = props

    return (
      <div className="title-ingress-wrapper">
        {introTitle && <p className="introTitle">{introTitle}</p>}
        <Title size={1} className="col-lg-10">{title}</Title>
        {ingress && <p className="ingress col-lg-8">{ingress}</p>}
      </div>
    )
  }

  function renderSNRDates() {
    const {
      serialNumber, phrases, showPubDate, pubDate, modifiedDate
    } = props

    return (
      <div className="snr-dates-wrapper">
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

    if (authors) {
      return (
        <div className="author-wrapper">
          <p>
            <span className="mr-1">{phrases.author}:</span>
            {authors.map((author, index) => {
              return (
                <span key={`author-${index}`}>
                  <Link href={author.email}>{author.name}</Link> {index < authors.length - 1 ? ', ' : ''}
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
      bodyText, associatedStatistics, associatedArticleArchives
    } = props

    if (bodyText) {
      return (
        <div className={`${associatedStatistics.length || associatedArticleArchives.length ? 'col-lg-6' : 'col-12'} col-md-12 p-0`}>
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
      associatedArticleArchives, phrases
    } = props

    if (associatedArticleArchives.length) {
      return (
        <div className="part-associated-article-archives">
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
    <section className="xp-part article container-fluid p-0 mb-5">
      <div className="row">
        <div className="col-12 offset-lg-1 p-0">
          <div className="container row p-0">
            {renderTitleIngress()}
            {renderSNRDates()}
            {renderAuthors()}
            {renderArticleBody()}
            {(props.associatedStatistics || props.associatedArticleArchives) &&
            <div className="col p-0">
              <Divider className="col-md-12 d-md-none" />
              {renderAssociatedStatistics()}
              {renderAssociatedArticleArchives()}
            </div>
            }
          </div>
        </div>
        {renderISBN()}
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
