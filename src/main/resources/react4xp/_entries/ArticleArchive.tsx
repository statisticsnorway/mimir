import React, { useState, useEffect } from 'react'
import { Divider, Button, LeadParagraph, Paragraph, Link } from '@statisticsnorway/ssb-component-library'
import { Container, Row, Col } from 'react-bootstrap'
import { ChevronDown } from 'react-feather'
import { default as groupBy } from 'ramda/es/groupBy'
import axios from 'axios'
import { sanitize } from '../../lib/ssb/utils/htmlUtils'
import { type ArticleArchiveProps, type ParsedArticleData } from '../../lib/types/partTypes/articleArchive'
import { generateImageUrls } from '../../lib/ssb/utils/generateImageUrlUtils'

function ArticleArchive(props: ArticleArchiveProps) {
  const {
    title,
    preamble,
    image,
    imageAltText,
    freeText,
    issnNumber,
    firstArticles,
    articleArchiveService,
    language,
    pageId,
    listOfArticlesSectionTitle,
    showMore,
    showMorePagination,
  } = props

  const [articles, setArticles] = useState(firstArticles.articles)
  const [totalCount, setTotalCount] = useState(firstArticles.total)
  const [loading, setLoading] = useState<boolean>()

  function fetchArticles() {
    setLoading(true)
    axios
      .get(articleArchiveService, {
        params: {
          start: articles.length,
          count: 15,
          language: language,
          pageId: pageId,
        },
      })
      .then((res) => {
        if (res.data.articles.length) {
          setArticles((prev) => [...prev, ...res.data.articles])
          setTotalCount(res.data.total)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  function renderShowMoreButton() {
    if (totalCount > articles.length) {
      return (
        <Row className='justify-content-center'>
          <Col className='col-auto'>
            <Button onClick={() => fetchArticles()}>
              <span className='sr-only'>{`${showMorePagination.replace('{0}', articles.length.toString())} ${totalCount}`}</span>
              {!loading ? (
                <span aria-hidden='true'>
                  <ChevronDown size='18' className='chevron-icons' />
                  {`${showMore} ${articles.length} / ${totalCount}`}
                </span>
              ) : (
                <span aria-hidden='true' className='spinner-border spinner-border-sm' />
              )}
            </Button>
          </Col>
        </Row>
      )
    }
    return null
  }

  function addArticles() {
    if (articles.length) {
      const groupByYear = groupBy((articles: ParsedArticleData) => {
        return articles.year as string
      })
      const groupArticlesByYearDesc = Object.entries(groupByYear(articles)).reverse()
      return groupArticlesByYearDesc.map(([year, articles], index) => {
        return (
          <Row className='articles-container' key={`groupedArticles-${index}`}>
            <Col className='col-12 col-lg-1 p-0'>
              <h2 id={`archive-articles-${year}`}>{year}</h2>
            </Col>
            <Col id='article-archive-list' className='col-12 col-lg-8 p-0'>
              <ol className='row p-0' aria-labelledby={`article-archive-heading archive-articles-${year}`}>
                {articles?.map((article, index) => {
                  const srSubtitle = article.subtitle.replace(' / ', ' ')
                  return (
                    <li key={`articles-${year}-${index}`} className='article-container col-12 p-0 mb-5'>
                      <Link linkType='header' href={article.href}>
                        <span aria-hidden='true'>{article.title}</span>
                        <span className='sr-only'>{`${article.title} ${srSubtitle.replace(year, '')}`}</span>
                      </Link>
                      <Paragraph className='mt-2 mb-1'>{article.preamble}</Paragraph>
                      <span className='ssb-text-wrapper small-text' aria-hidden='true'>
                        {article.subtitle}
                      </span>
                    </li>
                  )
                })}
              </ol>
            </Col>
          </Row>
        )
      })
    }
    return
  }

  return (
    <Container fluid>
      <Row>
        <Col className='col-12 col-lg-8 offset-lg-1 p-0'>
          <Row className='row'>
            <Col className='col-12 p-0'>
              <h1>{title}</h1>
              {preamble && <LeadParagraph className='preamble'>{preamble}</LeadParagraph>}
            </Col>
          </Row>
        </Col>
        {image && (
          <Col className='col-12 d-flex justify-content-center'>
            <img
              src={image}
              srcSet={`${generateImageUrls(image).imageMobileUrl} 600w, 
           ${generateImageUrls(image).imageTabletUrl} 992w, 
           ${image} 1180w`}
              sizes='(max-width: 600px) 600px, (max-width: 992px) 992px, 1180px'
              alt={imageAltText}
              loading='lazy'
              decoding='async'
              style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
            />
          </Col>
        )}
        <Col className='col-12 col-lg-10 offset-lg-1 p-0'>
          <Row className='list-of-articles-container'>
            <h2 id='article-archive-heading' className='list-of-articles-title col-12 p-0'>
              {listOfArticlesSectionTitle}
            </h2>
            <Divider light className='col-12' />
          </Row>
          {addArticles()}
          {renderShowMoreButton()}
        </Col>
        {freeText && (
          <Col className='col-12 col-lg-8 offset-lg-1 p-0'>
            <div className='row'>
              <div
                className='free-text'
                dangerouslySetInnerHTML={{
                  __html: sanitize(freeText),
                }}
              />
            </div>
          </Col>
        )}
        {issnNumber && (
          <Col className='col-12 p-0'>
            <p className='issn-text d-flex justify-content-center'>
              <span>{issnNumber}</span>
            </p>
          </Col>
        )}
      </Row>
    </Container>
  )
}

export default (props: ArticleArchiveProps) => <ArticleArchive {...props} />
