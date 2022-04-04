import React, { useEffect, useState } from 'react'
import { Divider, Button, Paragraph, Text, Link } from '@statisticsnorway/ssb-component-library'
import { Container, Row, Col } from 'react-bootstrap'
import { ChevronDown } from 'react-feather'
import { groupBy } from 'ramda'
import PropTypes from 'prop-types'
import { get } from 'axios'
function ArticleArchive(props) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState()
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    fetchArticles()
  }, [])

  function fetchArticles() {
    setLoading(true)
    get(props.articleArchiveService, {
      params: {
        start: articles.length,
        count: 15,
        language: props.language,
        pageId: props.pageId
      }
    }).then((res) => {
      if (res.data.articles.length) {
        setArticles((prev) => [...prev, ...res.data.articles])
        setTotalCount(res.data.totalCount)
      }
    })
      .finally(() => {
        setLoading(false)
      })
  }

  function renderShowMoreButton() {
    if (totalCount > articles.length) {
      return (
        <Row className="justify-content-center">
          <Col className="col-auto">
            <Button onClick={() => fetchArticles()}>
              <span className="sr-only">{`${props.showMorePagination.replace('{0}', articles.length)} ${totalCount}`}</span>
              <span aria-hidden="true">
                <ChevronDown size="18" className="chevron-icons" />{`${props.showMore} ${articles.length} / ${totalCount}`}
              </span>
            </Button>
          </Col>
        </Row>
      )
    }
    return null
  }

  function addArticles() {
    if (!loading && articles.length) {
      const groupByYear = groupBy((articles) => {
        return articles.year
      })
      const groupArticlesByYearDesc = Object.entries(groupByYear(articles)).reverse()
      return groupArticlesByYearDesc.map(([year, articles], index) => {
        return (
          <Row className="articles-container" key={`groupedArticles-${index}`}>
            <Col className="col-12 col-lg-1">
              <h2 id={`archive-articles-${year}`}>{year}</h2>
            </Col>
            <Col id="article-archive-list" className="col-12 col-lg-8 p-0">
              <ol className="row" aria-labelledby={`article-archive-heading archive-articles-${year}`}>
                {articles.map((article, index) => {
                  const srSubtitle = article.subtitle.replace(' / ', ' ')
                  return (
                    <li key={`articles-${year}-${index}`} className="article-container col-12">
                      <Link linkType="header" href={article.href}>
                        <span aria-hidden="true">{article.title}</span>
                        <span className="sr-only">
                          {`${article.title} ${srSubtitle.replace(year, '')}`}
                        </span>
                      </Link>
                      <Paragraph>{article.preamble}</Paragraph>
                      <Text small>{article.subtitle}</Text>
                    </li>
                  )
                })}
              </ol>
            </Col>
          </Row>
        )
      })
    }
    return <Row className="spinner-border spinner-border-sm" />
  }

  return (
    <Container className="list-of-articles-container">
      <Row>
        <h2 id="article-archive-heading" className="list-of-articles-title col-12">{props.listOfArticlesSectionTitle}</h2>
        <Divider light className="col-12" />
      </Row>
      {addArticles()}
      {renderShowMoreButton()}
    </Container>
  )
}

ArticleArchive.propTypes = {
  listOfArticlesSectionTitle: PropTypes.string,
  articleArchiveService: PropTypes.string,
  pageId: PropTypes.string,
  language: PropTypes.string,
  showMore: PropTypes.string,
  showLess: PropTypes.string,
  showMorePagination: PropTypes.string
}

export default (props) => <ArticleArchive {...props} />
