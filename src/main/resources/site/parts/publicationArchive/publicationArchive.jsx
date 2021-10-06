import React, { useEffect, useState } from 'react'
import { Button, Divider, Link, Title, Text } from '@statisticsnorway/ssb-component-library'
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
    articles,
    statisticsReleases,
    language,
    articleTypePhrases,
    showingPhrase
  } = props
  const [publications, setPublications] = useState(articles.publications)
  const [total, setTotal] = useState(articles.total + statisticsReleases.length)
  const [loading, setLoading] = useState(false)
  const [first, setFirst] = useState(true)
  const [statisticsPublications, setStatisticsPublications] = useState(statisticsReleases)
  const [diff, setDiff] = useState([0])

  useEffect(() => {
    if (first) {
      setFirst(false)
      setPublications(mergePublications(publications))
    }
  })

  function mergePublications(newPublications) {
    const filteredStatisticsReleases = []
    const filteredStatisticsReleasesRest = []

    statisticsPublications.forEach((statisticsRelease) => {
      const statisticsReleaseDate = new Date(statisticsRelease.publishDate)
      const latestNewPublicationDate = newPublications.length ? new Date(newPublications[0].publishDate) : new Date()
      const oldestNewPublicationDate = newPublications.length ? new Date(newPublications[newPublications.length - 1].publishDate) : new Date('01.01.1970')

      let dateCheck = statisticsReleaseDate <
      (publications.length ? new Date(publications[publications.length - 1].publishDate) : latestNewPublicationDate) &&
        statisticsReleaseDate > oldestNewPublicationDate
      if (statisticsReleaseDate > latestNewPublicationDate) {
        dateCheck = statisticsReleaseDate > oldestNewPublicationDate
      } else {
        dateCheck = statisticsReleaseDate < publications.length ? new Date(publications[publications.length - 1].publishDate) : latestNewPublicationDate
      }

      if (dateCheck) {
        filteredStatisticsReleases.push(statisticsRelease)
      } else {
        filteredStatisticsReleasesRest.push(statisticsRelease)
      }
    })
    setStatisticsPublications(filteredStatisticsReleasesRest)

    const diffValues = []
    const mergedPublications = newPublications.length ?
      filteredStatisticsReleases.concat(newPublications)
        .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate)) :
      filteredStatisticsReleases.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))

    if (mergedPublications.length > 10) {
      const restMergedPublications = mergedPublications.slice(10, mergedPublications.length)
      const restStatistics = restMergedPublications.filter((p) => p.contentType === `${p.appName}:statistics`)
      if (restStatistics.length) {
        setStatisticsPublications(filteredStatisticsReleasesRest.concat(restStatistics))
      }

      diffValues.push(mergedPublications.length - (10 + restStatistics.length))
      setDiff(diff.concat(diffValues))

      return mergedPublications.slice(0, 10)
    } else {
      diffValues.push(0)
      setDiff(diff.concat(diffValues))
      return mergedPublications
    }
  }

  function fetchPublications() {
    setLoading(true)
    const indexDiff = diff.map((d) => d).reduce((acc, curr) => acc + curr)
    axios.get(publicationArchiveServiceUrl, {
      params: {
        start: publications.length - indexDiff,
        count: 10,
        language: language
      }
    }).then((res) => {
      setPublications(publications.concat(mergePublications(res.data.publications)))
      setTotal(res.data.total + statisticsReleases.length)
    }).finally(() => {
      setLoading(false)
    })
  }

  function renderPublications() {
    return publications.map((publication, i) => {
      return (
        <div key={i} className="row mb-5">
          <div className="col">
            <Link href={publication.url} className="ssb-link header">
              {publication.title}
            </Link>
            {publication.period && <p className="mt-1 mb-0">{publication.period}</p>}
            <p className="my-1">
              <Truncate lines={2}>
                {publication.preface}
              </Truncate>
            </p>
            <Text small>
              {getArticleType(publication)} /&nbsp;
              <time dateTime={publication.publishDate}>{publication.publishDateHuman}</time>
              {publication.mainSubject && `/ ${publication.mainSubject}`}
            </Text>
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
  articles: PropTypes.objectOf({
    total: PropTypes.number,
    publications: PropTypes.array
  }),
  statisticsReleases: PropTypes.array,
  articleTypePhrases: PropTypes.objectOf(PropTypes.string)
}
