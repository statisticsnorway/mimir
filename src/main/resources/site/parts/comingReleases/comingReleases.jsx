import React, { useState } from 'react'
import { Button, Link, Paragraph, Title } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import axios from 'axios'
import { ChevronDown } from 'react-feather'

function ComingReleases(props) {
  const [start, setStart] = useState(props.start)
  const [releases, setReleases] = useState(props.releases)

  const unitProps = ['year', 'month', 'day']
  function mergeAnnualReleases(array1, array2) {
    let array1Index = 0
    let array2Index = 0
    const mergedArrays = []
    while (array1Index < array1.length || array2Index < array2.length) {
      const value1 = array1[array1Index] ? parseInt(array1[array1Index].year) : undefined
      const value2 = array2[array2Index] ? parseInt(array2[array2Index].year) : undefined
      if (value1 === value2) {
        const allMonthlyReleases = mergeMonthlyReleases(array1[array1Index].releases, array2[array2Index].releases)
        mergedArrays.push({
          ...array1[array1Index],
          releases: allMonthlyReleases
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

  function mergeMonthlyReleases(array1, array2) {
    let array1Index = 0
    let array2Index = 0
    const mergedArrays = []
    while (array1Index < array1.length || array2Index < array2.length) {
      const value1 = array1[array1Index] ? parseInt(array1[array1Index].month) : undefined
      const value2 = array2[array2Index] ? parseInt(array2[array2Index].month) : undefined
      if (value1 === value2) {
        const allDailyReleases = mergeDailyReleases(array1[array1Index].releases, array2[array2Index].releases)
        mergedArrays.push({
          ...array1[array1Index],
          releases: allDailyReleases
        })
        array1Index++
        array2Index++
      } else if ((!value2 && value1) || (array1[array1Index] && (value1 < value2))) {
        mergedArrays.push(array1[array1Index])
        array1Index++
      } else if ((!value1 && value2) || (array2[array2Index] && (value2 < value1))) {
        mergedArrays.push(array2[array2Index])
        array2Index++
      } else {
        array1Index++
        array2Index++
      }
    }
    return mergedArrays
  }

  function mergeDailyReleases(array1, array2) {
    let array1Index = 0
    let array2Index = 0
    const mergedArrays = []
    while (array1Index < array1.length || array2Index < array2.length) {
      const value1 = array1[array1Index] ? parseInt(array1[array1Index].day) : undefined
      const value2 = array2[array2Index] ? parseInt(array2[array2Index].day) : undefined
      if (value1 === value2) {
        const nextMergedArray = array1[array1Index].releases.concat( array2[array2Index].releases)
        mergedArrays.push(nextMergedArray)
        array1Index++
        array2Index++
      } else if ((!value2 && value1) || (array1[array1Index] && (value1 < value2))) {
        mergedArrays.push(array1[array1Index])
        array1Index++
      } else if ((!value1 && value2) || (array2[array2Index] && (value2 < value1))) {
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
    axios.get(props.upcomingReleasesServiceUrl, {
      params: {
        start,
        count: props.count,
        language: props.language
      }
    }).then((res) => {
      const totalReleases = mergeAnnualReleases(releases, res.data.releases)
      console.log('totalReleases')
      console.log(totalReleases)
      setReleases(totalReleases)
      setStart(start + props.count)
    }).finally(() => {
      // setLoadedFirst(true)
      // setArticleStart((prevState) => prevState + props.count)
    }
    )
  }

  function renderRelease(release, index, date) {
    return (
      <li key={index}>
        <Link href={`/${release.shortName}`} linkType='header'>{release.name}</Link>
        <Paragraph className="mb-0">{release.variant.period}</Paragraph>
        <Paragraph className="metadata">
          {date.day}. {date.monthName} {date.year} / <span className="type">{release.type}</span> / {release.mainSubject}
        </Paragraph>
      </li>
    )
  }

  function renderDay(day, month, year, index) {
    const date = {
      day: day.day,
      monthName: month.monthName,
      year: year.year
    }
    return (
      <article className={index === 0 ? 'first' : ''} key={index}>
        <time dateTime={`${year}-${month.month}`}>
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


  return (
    <section className='nextStatisticsReleases'>
      <Title size={2}>{props.title}</Title>
      {
        releases.map((year) => {
          return year.releases.map((month) => {
            return month.releases.map((day, index) => renderDay(day, month, year, index))
          })
        })
      }
      <div>
        <Button className="button-more mt-5"
          onClick={fetchMoreReleases}><ChevronDown
            size="18"/>{props.buttonTitle}
        </Button>
      </div>
    </section>
  )
}

ComingReleases.propTypes = {
  title: PropTypes.string,
  language: PropTypes.string,
  upcomingReleasesServiceUrl: PropTypes.string,
  start: PropTypes.number,
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

export default (props) => <ComingReleases {...props}/>
