import React, { useEffect, useState } from 'react'
import { Title, Link, Button, Divider, Dropdown } from '@statisticsnorway/ssb-component-library'
import { ChevronDown } from 'react-feather'
import axios from 'axios'
import { type SubjectArticleListProps } from '../../../lib/types/partTypes/subjectArticleList'
import { type DropdownItem } from '../../../lib/types/partTypes/publicationArchive'

/* TODO:
- Fikse sortering (?)
- Hva og hvordan skal vi sortere/filtrere etter innholdstype??
- Idé: Returere aggregert liste over funnede metadata-parametre fra service, så kan man velge en av dem og filtrere listen på denne??
- ???
- profit
*/

function SubjectArticleList(props: SubjectArticleListProps) {
  const [articles, setArticles] = useState(props.articles)
  const [articleStart, setArticleStart] = useState(props.start)
  const [loadedFirst, setLoadedFirst] = useState(true)
  const [totalCount, setTotalCount] = useState(props.articles.length)
  const [sort, setSort] = useState({
    title: 'Nyeste',
    id: 'DESC',
  })
  const showCountLabel =
    props.language == 'en'
      ? `Showing ${articles.length} of ${props.totalArticles}`
      : `Viser ${articles.length} av ${props.totalArticles}`

  useEffect(() => {
    if (loadedFirst) {
      setLoadedFirst(false)
      setArticleStart(articleStart + props.count)
    }
  }, [])

  function fetchMoreArticles() {
    axios
      .get(props.articleServiceUrl, {
        params: {
          currentPath: props.currentPath,
          start: articleStart,
          count: props.count,
          sort: sort.id,
          language: props.language,
        },
      })
      .then((res) => {
        setArticles(articles.concat(res.data.articles))
        setTotalCount((prevState) => prevState + res.data.articles.length)
      })
      .finally(() => {
        setArticleStart((prevState) => prevState + props.count)
      })
  }

  function fetchArticlesStartOver(order: string) {
    setArticleStart(props.start)
    axios
      .get(props.articleServiceUrl, {
        params: {
          currentPath: props.currentPath,
          start: props.start,
          count: props.count,
          sort: order,
          language: props.language,
        },
      })
      .then((res) => {
        setArticles(res.data.articles)
        setTotalCount(res.data.totalCount)
        setLoadedFirst(true)
      })
  }

  function renderArticles() {
    return (
      <ol className='list-unstyled'>
        {articles.map((article, i) => {
          return (
            <li key={i}>
              {/* deepcode ignore DOMXSS: url comes from pageUrl which escapes + Reacts own escaping */}
              <Link href={article.url} linkType='header' standAlone>
                {article.title}
              </Link>
              <p className='truncate-2-lines'>{article.preface}</p>
              <time dateTime={article.publishDate}>{article.publishDateHuman}</time>
            </li>
          )
        })}
      </ol>
    )
  }

  function renderSortAndFilter() {
    if (props.showSortAndFilter) {
      return (
        <div className='col-md-6 col-12'>
          <span className='mb-3'>Sorter innholdet</span>
          <Dropdown
            header='Sorter etter dato'
            items={[
              {
                title: 'Nyeste',
                id: 'DESC',
              },
              {
                title: 'Eldste',
                id: 'ASC',
              },
            ]}
            selectedItem={sort}
            onSelect={(selected: DropdownItem) => {
              setSort(selected)
              fetchArticlesStartOver(selected.id)
            }}
          />
        </div>
      )
    }
  }

  function renderShowMoreButton() {
    if (!props.showAllArticles) {
      return (
        <div>
          <Button
            disabled={totalCount > 0 && totalCount >= props.totalArticles}
            className='button-more'
            onClick={fetchMoreArticles}
          >
            <ChevronDown size='18' />
            {props.buttonTitle}
          </Button>
        </div>
      )
    }
  }

  return (
    <section className='subject-article-list container-fluid'>
      <div className='container'>
        <div className='row'>
          <Title size={2}>{props.title}</Title>
        </div>
        <div className='row justify-content-md-center'>
          {renderSortAndFilter()}
          <div className='col-md-6 col-12'>
            <div className='total-count'>{showCountLabel}</div>
            <Divider />
            {renderArticles()}
            {renderShowMoreButton()}
          </div>
        </div>
      </div>
    </section>
  )
}

export default (props: SubjectArticleListProps) => <SubjectArticleList {...props} />
