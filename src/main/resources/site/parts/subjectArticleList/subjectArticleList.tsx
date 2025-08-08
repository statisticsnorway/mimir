import React, { useState } from 'react'
import { Title, Link, Button, Divider, Dropdown } from '@statisticsnorway/ssb-component-library'
import { ChevronDown, ChevronUp } from 'react-feather'
import axios from 'axios'
import { type SubjectArticleListProps } from '/lib/types/partTypes/subjectArticleList'
import { type DropdownItem } from '/lib/types/partTypes/publicationArchive'
import { usePagination } from '/lib/ssb/utils/customHooks/paginationHooks'

/* TODO:
- Fikse sortering (?)
- Hva og hvordan skal vi sortere/filtrere etter innholdstype??
- Idé: Returere aggregert liste over funnede metadata-parametre fra service, så kan man velge en av dem og filtrere listen på denne??
- ???
- profit
*/

function SubjectArticleList(props: SubjectArticleListProps) {
  const {
    articles,
    count,
    totalArticles,
    currentPath,
    language,
    articleServiceUrl,
    start,
    showMore,
    showLess,
    showCount,
    title,
    showSortAndFilter,
  } = props

  const [articleList, setArticleList] = useState(articles)
  const [sort, setSort] = useState({
    title: 'Nyeste',
    id: 'DESC',
  })

  const {
    getCurrentElementRef,
    handleKeyboardNavigation,
    handleOnClick,
    showLess: showLessBtn,
    hideBtn,
  } = usePagination({
    list: articleList,
    listItemsPerPage: count,
    onLoadMore: () => fetchMoreArticles(),
    onLoadFirst: () => fetchArticlesStartOver(sort.id),
    totalCount: totalArticles,
  })

  const showCountLabel = `${showCount.replaceAll('{0}', articleList.length.toString())} ${totalArticles}`

  function fetchMoreArticles() {
    axios
      .get(articleServiceUrl, {
        params: {
          currentPath: currentPath,
          start: articleList.length,
          count,
          sort: sort.id,
          language,
        },
      })
      .then((res) => {
        setArticleList(articleList.concat(res.data.articles))
      })
  }

  function fetchArticlesStartOver(order: string) {
    axios
      .get(articleServiceUrl, {
        params: {
          currentPath,
          start,
          count,
          sort: order,
          language,
        },
      })
      .then((res) => {
        setArticleList(res.data.articles)
      })
  }

  function renderArticles() {
    return (
      <ol className='list-unstyled'>
        {articleList.map(({ title, url, preface, publishDate, publishDateHuman }, i) => {
          return (
            <li key={`${title}-${i}`}>
              {/* deepcode ignore DOMXSS: url comes from pageUrl which escapes + Reacts own escaping */}
              <Link ref={getCurrentElementRef(i)} href={url} linkType='header' headingSize={3} standAlone>
                {title}
              </Link>
              <p className='truncate-2-lines'>{preface}</p>
              <time dateTime={publishDate}>{publishDateHuman}</time>
            </li>
          )
        })}
      </ol>
    )
  }

  function renderSortAndFilter() {
    if (showSortAndFilter) {
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
    if (!hideBtn) {
      return (
        <div>
          <Button className='button-more' onClick={handleOnClick} onKeyDown={handleKeyboardNavigation}>
            {!showLessBtn ? (
              <>
                <ChevronDown size='18' /> {showMore}
              </>
            ) : (
              <>
                <ChevronUp size='18' /> {showLess}
              </>
            )}
          </Button>
        </div>
      )
    }
  }

  return (
    <section className='subject-article-list container-fluid'>
      <div className='container'>
        <div className='row'>
          <Title size={2}>{title}</Title>
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
