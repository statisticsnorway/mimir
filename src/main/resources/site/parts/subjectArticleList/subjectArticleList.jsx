import React, { useEffect, useState } from 'react'
import { Link,
  Button,
  Divider,
  Dropdown } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { ChevronDown } from 'react-feather'
import Truncate from 'react-truncate'
import axios from 'axios'

/* TODO:
- Fikse sortering (?)
- Hva og hvordan skal vi sortere/filtrere etter innholdstype??
- Idé: Returere aggregert liste over funnede metadata-parametre fra service, så kan man velge en av dem og filtrere listen på denne??
- ???
- profit
*/

function SubjectArticleList(props) {
  const [articles, setArticles] = useState([])
  const [articleStart, setArticleStart] = useState(props.start)
  const [loadedFirst, setLoadedFirst] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [sort, setSort] = useState('DESC')

  useEffect(
    () => {
      if (!loadedFirst) {
        fetchArticles()
      }
    },
    [],
  )

  function fetchArticles() {
    axios.get(props.articleServiceUrl, {
      params: {
        currentPath: props.currentPath,
        start: articleStart,
        count: props.count,
        sort: sort
      }
    }).then((res) => {
      setArticles(articles.concat(res.data.articles))
      setTotalCount(res.data.totalCount)
    }).finally(
      setLoadedFirst(true),
      setArticleStart((prevState) => prevState + props.count),
    )
  }

  function renderArticles() {
    return (
      articles.map((article, i) => {
        return (
          <div key={i} className="mt-5">
            <Link href={article.url} className="ssb-link header">
              {article.title}
            </Link>
            <p>
              <Truncate lines={2}
                className="article-list-ingress">{article.preface}</Truncate>
            </p>
            <time dateTime={article.publishDate}>
              {article.publishDateHuman}
            </time>
          </div>
        )
      },
      ))
  }

  return (
    <section className="subject-article-list container-fluid">
      <div className="container pt-5 pb-5">
        <h3 className="mb-5">{props.title}</h3>

        <div className="row">

          <div className="col-md-6 col-12">
            <span className="mb-3">Sorter innholdet</span>
            <Dropdown header="sorter etter dato" items={[
              {
                title: 'Nyeste',
                id: 'DESC'
              },
              {
                title: 'Eldste',
                id: 'ASC'
              }]}
            selectedItem={{
              title: 'Nyeste',
              id: 'DESC'
            }}
            onSelect={(selected) => {
              // TODO: This does not work as intended, articles is not being cleared correctly - or concurrently - by this. Rethink!
              setArticles([])
              setSort(selected.id)
              setArticleStart(props.start)
              setTotalCount(0)
              fetchArticles()
            }
            }/>
          </div>

          <div className="col-md-6 col-12">
            <div
              className="total-count mb-2">Viser {articles.length} av {totalCount}
            </div>

            <Divider dark={true}/>

            {
              renderArticles()
            }

            <div>
              <Button disabled={(totalCount > 0) &&
                (totalCount <= articles.length)} className="button-more mt-5"
              onClick={fetchArticles}><ChevronDown
                  size="18"/>{props.buttonTitle}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

SubjectArticleList.propTypes =
    {
      title: PropTypes.string,
      buttonTitle: PropTypes.string,
      articleServiceUrl: PropTypes.string,
      currentPath: PropTypes.string,
      start: PropTypes.number,
      count: PropTypes.number
    }

export default (props) => <SubjectArticleList {...props} />
