import React, { useState } from 'react'
import { Button, Link, Paragraph, Title } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import axios from 'axios'
import { ChevronDown } from 'react-feather'

function UpcomingReleases(props) {
  console.log("RENDER UPCOMING RELEASES")
  console.log(props)
  const [releases, setReleases] = useState(props.releases)
  const [loading, setLoading] = useState(false)
  let lastCountedDay = undefined

  const unitProps = ['year', 'month', 'day']

  function mergeReleases(array1, array2, lvl) {
    let array1Index = 0
    let array2Index = 0
    const unitProp = unitProps[lvl]
    const mergedArrays = []
    while (array1Index < array1.length || array2Index < array2.length) {
      const value1 = array1[array1Index] ? parseInt(array1[array1Index][unitProp]) : undefined
      const value2 = array2[array2Index] ? parseInt(array2[array2Index][unitProp]) : undefined
      if (value1 === value2) {
        const mergedReleases = unitProp === 'day' ?
          array1[array1Index].releases.concat(array2[array2Index].releases) :
          mergeReleases(array1[array1Index].releases, array2[array2Index].releases, lvl + 1)
        mergedArrays.push({
          ...array1[array1Index],
          releases: mergedReleases
        })
        array1Index++
        array2Index++
      } else if ((!value2 && value1) || array1[array1Index] && (value1 < value2)) {
        mergedArrays.push(array1[array1Index])
        array1Index++
      } else if ((!value1 && value2) || array2[array2Index] && (value2 < value1)) {
        mergedArrays.push(array2[array2Index])
        array2Index++
      } else {
        array1Index++
        array2Index++
      }
    }
    return mergedArrays
  }

  function fetchMoreReleases() {
    setLoading(true)
    console.log('lastCoundedDay')
    console.log(lastCoundedDay)
    if(!lastCountedDay){
      return
    }
    axios.get(props.upcomingReleasesServiceUrl, {
      params: {
        start: `${lastCountedDay.day}-${lastCountedDay.month}-${lastCountedDay.year}`,
        count: props.count,
        language: props.language
      }
    }).then((res) => {
      const totalReleases = mergeReleases(releases, res.data.releases, 0)
      setReleases(totalReleases)
    }).finally(() => {
      setLoading(false)
    })
  }

  function renderRelease(release, index, date) {
    return (
      <li key={index}>
        <Link href={`/${release.shortName}`} linkType='header'>{release.name}</Link>
        <Paragraph className="mb-0">{release.variant.period}</Paragraph>
        <Paragraph className="metadata">
          {date.day}. {date.monthName} {date.year} / <span
          className="type">{release.type}</span> / {release.mainSubject}
        </Paragraph>
      </li>
    )
  }

  function renderDay(day, month, year, index) {
    const date = {
      day: day.day,
      monthName: month.monthName,
      month: month.month,
      year: year.year
    }
    return (
      <article className={index === 0 ? 'first' : ''} key={index}>
        <time dateTime={`${year.year}-${month.month}`}>
          <span className='day'>{day.day}</span>
          <span className='month'>{month.monthName}</span>
        </time>
        <ol className='releaseList'>
          {
            day.releases.map((release, releaseIndex) => renderRelease(release, releaseIndex, date))
          }
        </ol>
      </article>
    )
  }

  function renderButton() {
    if (loading) {
      return (<div className="text-center mt-5">
        <span className="spinner-border spinner-border"/>
      </div>)
    } else {
      return (<Button className="button-more mt-5 mx-auto"
        disabled={loading}
        onClick={fetchMoreReleases}>
        <ChevronDown size="18"/>{props.buttonTitle}
      </Button>)
    }
  }

  function renderList(){
    let lastDay = {}
    const list  = releases.map((year) => {
      return year.releases.map((month) => {
        return month.releases.map((day, index) => {
          lastDay = {year: year.year, month: month.month, day: day.day}
          //console.log(lastDay)
          return renderDay(day, month, year, index)
        })
      })
    })
    console.log('lastDay')
    console.log(lastDay)
    lastCountedDay = lastDay
    return list
  }

  return (
    <section className='nextStatisticsReleases'>
      <div className="upcoming-releases-head py-5 px-2">
        <Title>{props.title ? props.title : undefined}</Title>
        <div className="upcoming-releases-ingress" dangerouslySetInnerHTML={{
          __html: props.preface.replace(/&nbsp;/g, ' ')
        }}>
        </div>
      </div>
      <div className="release-list mt-5">
        { renderList() }
      </div>
      <div>
        { renderButton() }
      </div>
    </section>
  )
}

UpcomingReleases.propTypes = {
  title: PropTypes.string,
  preface: PropTypes.string,
  language: PropTypes.string,
  upcomingReleasesServiceUrl: PropTypes.string,
  count: PropTypes.number,
  buttonTitle: PropTypes.string,
  releases: PropTypes.arrayOf(PropTypes.shape({
    year: PropTypes.string,
    releases: PropTypes.arrayOf(PropTypes.shape({
      month: PropTypes.string,
      monthName: PropTypes.string,
      releases: PropTypes.arrayOf(PropTypes.shape({
        day: PropTypes.string,
        releases: PropTypes.arrayOf(
          PropTypes.shape({
            date: PropTypes.shape({
              day: PropTypes.string,
              month: PropTypes.string,
              year: PropTypes.string
            }),
            statistics: PropTypes.arrayOf(
              PropTypes.shape({
                shortName: PropTypes.string,
                name: PropTypes.string,
                nameEN: PropTypes.string,
                modifiedTime: PropTypes.string,
                type: PropTypes.string,
                mainSubject: PropTypes.string,
                variants: {
                  frekvens: PropTypes.string,
                  nextRelease: PropTypes.string
                }
              })
            )
          })
        )
      }))
    }))
  }))
}

export default (props) => <UpcomingReleases {...props} />
