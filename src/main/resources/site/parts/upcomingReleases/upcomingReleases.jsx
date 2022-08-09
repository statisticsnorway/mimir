import React, { useState } from 'react'
import { Button, Link, Paragraph, Title } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import axios from 'axios'
import { ChevronDown } from 'react-feather'

function UpcomingReleases(props) {
  const [releases, setReleases] = useState(mergeContentReleases(props.releases))
  const [loading, setLoading] = useState(false)
  const [showAll, setShowAll] = useState(false)
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

  function mergeContentReleases(newReleases) {
    const lastYearIndex = newReleases.length - 1
    const lastYear = newReleases[lastYearIndex]
    const lastMonthIndex = lastYear.releases.length - 1
    const lastMonth = lastYear.releases[lastMonthIndex]
    const lastDayIndex = lastMonth.releases.length - 1
    const lastDay = lastMonth.releases[lastDayIndex]
    const last = new Date().setFullYear(lastYear.year, lastMonth.month, lastDay.day)
    const contentReleases = props.contentReleases.filter((r) => {
      if (new Date(r.date) <= last) {
        return true
      }
      return false
    })
    contentReleases.forEach((release, i) => {
      const releaseDate = new Date(release.date)
      let yearReleases
      for (let i = 0; i < newReleases.length; i += 1) {
        if (newReleases[i].year < releaseDate.getFullYear() && i !== newReleases.length - 1) {
          continue
        } else if (newReleases[i].year == releaseDate.getFullYear()) {
          yearReleases = newReleases[i]
          break
        } else if (newReleases[i].year > releaseDate.getFullYear() || i === newReleases.length - 1) {
          yearReleases = {
            year: releaseDate.getFullYear(),
            releases: [
              {
                month: releaseDate.getMonth(),
                monthName: release.monthName,
                releases: [
                  {
                    day: releaseDate.getDate(),
                    releases: []
                  }
                ]
              }
            ]
          }
          newReleases.splice(i + (newReleases[i].year > releaseDate.getFullYear() ? 0 : 1), 0, yearReleases)
          break
        }
      }
      let monthReleases
      for (let i = 0; i < yearReleases.releases.length; i += 1) {
        if (yearReleases.releases[i].month < releaseDate.getMonth() && i !== yearReleases.releases.length - 1) {
          continue
        } else if (yearReleases.releases[i].month == releaseDate.getMonth()) {
          monthReleases = yearReleases.releases[i]
          break
        } else if (yearReleases.releases[i].month > releaseDate.getMonth() || i === yearReleases.releases.length - 1) {
          monthReleases = {
            month: releaseDate.getMonth(),
            monthName: release.monthName,
            releases: [
              {
                day: releaseDate.getDate(),
                releases: []
              }
            ]
          }
          yearReleases.releases.splice(i + (yearReleases.releases[i].month > releaseDate.getMonth() ? 0 : 1), 0, monthReleases)
          break
        }
      }
      let dayReleases
      for (let i = 0; i < monthReleases.releases.length; i += 1) {
        if (monthReleases.releases[i].day < releaseDate.getDate() && i !== monthReleases.releases.length - 1) {
          continue
        } else if (monthReleases.releases[i].day == releaseDate.getDate()) {
          dayReleases = monthReleases.releases[i]
          break
        } else if (monthReleases.releases[i].day > releaseDate.getDate() || i === monthReleases.releases.length - 1) {
          dayReleases = {
            day: releaseDate.getDate(),
            releases: []
          }
          monthReleases.releases.splice(i + (monthReleases.releases[i].day > releaseDate.getDate() ? 0 : 1), 0, dayReleases)
          break
        }
      }
      if (dayReleases && !dayReleases.releases.find((r) => r.id === release.id)) {
        dayReleases.releases.push(release)
      }
    })
    return newReleases
  }

  function fetchMoreReleases() {
    setLoading(true)
    if (!lastCountedDay) {
      return
    }
    axios.get(props.upcomingReleasesServiceUrl, {
      params: {
        start: `${lastCountedDay.year}-${(parseInt(lastCountedDay.month) + 1)}-${lastCountedDay.day}`,
        count: props.count,
        language: props.language
      }
    }).then((res) => {
      if (res.data.releases.length) {
        let newReleases = mergeReleases(releases, res.data.releases, 0)
        newReleases = mergeContentReleases(newReleases)
        setReleases(newReleases)
      } else {
        setLoading(true)
      }
    }).finally(() => {
      setLoading(false)
    })
  }

  function fetchAllReleases() {
    setLoading(true)
    setShowAll(true)
    axios.get(props.upcomingReleasesServiceUrl, {
      params: {
        start: `${lastCountedDay.year}-${(parseInt(lastCountedDay.month) + 1)}-${lastCountedDay.day}`,
        showAll: true,
        language: props.language
      }
    }).then((res) => {
      if (res.data.releases.length) {
        let newReleases = mergeReleases(releases, res.data.releases, 0)
        newReleases = mergeContentReleases(newReleases)
        setReleases(newReleases)
      } else {
        setLoading(true)
      }
    }).finally(() => {
      setLoading(false)
    })
  }

  function renderRelease(release, index, date) {
    const {
      type, name, variant, mainSubject, statisticsPageUrl, upcomingReleaseLink
    } = release
    const {
      day, monthName, year
    } = date
    const statisticsPageUrlText = props.statisticsPageUrlText
    const showPeriod = (type === 'statistikk' || type === 'statistic')

    return (
      <li key={index} className="mb-3">
        <div>
          {!upcomingReleaseLink &&
            <span className="sr-only">{`${name} - ${showPeriod ? variant.period : ''}`}</span>
          }

          {upcomingReleaseLink ?
            <Link href={upcomingReleaseLink} linkType='header'>{name}</Link> :
            <h3 className="mb-0" aria-hidden="true">{name}</h3>
          }

          {showPeriod &&
            <p className="mb-0" aria-hidden="true">{variant.period}</p>
          }
          <p className="metadata" aria-hidden="true">
            {day}. {monthName} {year} / <span
              className="type">{type}</span> / {mainSubject}
          </p>
        </div>
        {statisticsPageUrl &&
          <div className="statisticsPageLink">
            <Link href={statisticsPageUrl}>{statisticsPageUrlText}</Link>
          </div>}
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

    const monthNumber = Number(month.month)
    const monthPadded = monthNumber < 9 ? '0' + (monthNumber + 1) : monthNumber + 1
    const dateTime = `${day.day}.${monthPadded}.${year.year}`
    const monthNames = props.language === 'en' ?
      ['january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'] :
      ['januar', 'februar', 'mars', 'april', 'mai', 'juni',
        'juli', 'august', 'september', 'oktober', 'november', 'desember']
    const monthNameLong = monthNames[monthNumber]

    return (
      <div className={`calendar-day ${index === 0 ? 'first' : ''}`} key={index}>
        <span id={`datemonth-${monthNumber}${index}`} className="sr-only" aria-hidden="true">{`${day.day}. ${monthNameLong}`}</span>
        <ol className='releaseList' aria-labelledby={`heading-upcoming-releases datemonth-${monthNumber}${index}`}>
          <time aria-hidden="true" dateTime={dateTime}>
            <span className='day'>{day.day}</span>
            <span className='month'>{month.monthName}</span>
          </time>
          {
            day.releases.map((release, releaseIndex) => renderRelease(release, releaseIndex, date))
          }
        </ol>
      </div>
    )
  }

  function renderButton() {
    if (loading) {
      return (<div className="text-center">
        <span className="spinner-border spinner-border"/>
      </div>)
    } else {
      return (<Button className="button-more"
        disabled={loading || showAll}
        onClick={fetchAllReleases}>
        <ChevronDown size="18"/>{props.buttonTitle}
      </Button>)
    }
  }

  function renderList() {
    let lastDay = {}
    const list = releases.map((year) => {
      return year.releases.map((month) => {
        return month.releases.map((day, index) => {
          lastDay = {
            year: year.year,
            month: month.month,
            day: day.day
          }
          return renderDay(day, month, year, index)
        })
      })
    })
    lastCountedDay = lastDay
    return list
  }

  return (
    <section className='nextStatisticsReleases container-fluid p-0'>
      <div className="row extended-banner">
        <div className="col-12 upcoming-releases-head px-4">
          <div className="container py-5">
            <h1 id="heading-upcoming-releases">{props.title ? props.title : undefined}</h1>
            <div className="upcoming-releases-ingress" dangerouslySetInnerHTML={{
              __html: props.preface.replace(/&nbsp;/g, ' ')
            }}>
            </div>
          </div>
        </div>
        <div className="col-12 release-list px-4">
          <div className="container mt-5">
            <div className="row d-flex justify-content-center">
              <div className="col-12 p-0">
                { renderList() }
                { renderButton() }
              </div>
            </div>
          </div>
        </div>
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
  statisticsPageUrlText: PropTypes.string,
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
                },
                statisticsPageUrl: PropTypes.string
              })
            )
          })
        )
      }))
    }))
  })),
  contentReleases: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      date: PropTypes.string,
      type: PropTypes.string,
      mainSubject: PropTypes.string,
      day: PropTypes.string,
      month: PropTypes.string,
      monthName: PropTypes.string,
      year: PropTypes.string,
      upcomingReleaseLink: PropTypes.string,
      statisticsPageUrl: PropTypes.string
    })
  )
}

export default (props) => <UpcomingReleases {...props} />
