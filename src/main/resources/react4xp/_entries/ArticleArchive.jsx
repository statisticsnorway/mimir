import React, { useEffect, useState } from 'react'
import { Button, Divider, Link, Paragraph, Text, Title } from '@statisticsnorway/ssb-component-library'
import { Container, Row, Col } from 'react-bootstrap'
import { ChevronDown, ChevronUp } from 'react-feather'
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

  const fetchArticles = () => {
    setLoading(true)
    get(props.articleArchiveService, {
      params: {
        start: articles.length,
        count: 10,
        language: props.language,
        pageId: props.pageId
      }
    }).then((res) => {
      console.log(res)
      if (res.data.articles.length) {
        setArticles((prev) => [...prev, ...res.data.articles])
        setTotalCount(res.data.totalCount)
      }
    })
      .finally(() => {
        setLoading(false)
      })
  }

  function onShowMoreButtonOnClick() {
    if (totalCount > articles.length) {
      fetchArticles()
    }
    // TODO: Add functionality for show less
  }

  const renderShowMoreButton = () => {
    if (totalCount > 10) {
      return (
        <Row className="hide-show-btn justify-content-center">
          <Col className="col-auto">
            <Button onClick={onShowMoreButtonOnClick}>
              {totalCount > articles.length ?
                <span>
                  <ChevronDown size="18" className="chevron-icons" />{`${props.showAll} ${articles.length}/ ${totalCount}`}
                </span> :
                <span>
                  <ChevronUp size="18" className="chevron-icons" />{`${props.showLess} ${totalCount}/ ${totalCount}`}
                </span>}
            </Button>
          </Col>
        </Row>
      )
    }
  }

  const addArticles = () => {
    if (!loading && articles.length) {
      const groupByYear = groupBy((articles) => {
        return articles.year
      })
      const groupArticlesByYearDesc = Object.entries(groupByYear(articles)).reverse()
      return groupArticlesByYearDesc.map(([year, articles], index) => {
        return (
          <Row className="articles-container" key={`groupedArticles-${index}`}>
            <Col className="col-12 col-lg-1">
              <Title size={2}>{year}</Title>
            </Col>
            <Col className="col-12 col-lg-8 p-0">
              <Row className="row">
                {articles.map((article, index) => {
                  return (
                    <Col key={`article-${index}`} className="article-container col-12">
                      <Text small>{article.subtitle}</Text>
                      <p><Link href={article.href} linkType='header'>{article.title}</Link></p>
                      <Paragraph>{article.preamble}</Paragraph>
                    </Col>
                  )
                })}
              </Row>
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
        <Title size={2} className="list-of-articles-title col-12">{props.listOfArticlesSectionTitle}</Title>
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
  showAll: PropTypes.string.isRequired,
  showLess: PropTypes.string.isRequired
}

export default (props) => <ArticleArchive {...props} />
