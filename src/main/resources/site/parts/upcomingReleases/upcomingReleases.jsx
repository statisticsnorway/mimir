import React, { useState } from 'react'
import { Button, Link } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import axios from 'axios'
import { ChevronDown } from 'react-feather'

export const mergeAndSortReleases = (releases1, releases2) => {
  const merged = new Map()

  // Helper function to add data to the map
  const addToMap = (array) => {
    array.forEach((item) => {
      // Check if the date already exists in the map
      if (merged.has(item.date)) {
        // If it does, concat the releases
        merged.get(item.date).releases = merged.get(item.date).releases.concat(item.releases)
      } else {
        // If not, add the item to the map
        merged.set(item.date, { ...item })
      }
    })
  }

  // Add both arrays to the map
  addToMap(releases1)
  addToMap(releases2)

  // Remove duplicate releases
  merged.forEach((value) => {
    const uniqueReleases = new Set()
    value.releases = value.releases.filter((release) => {
      const isDuplicate = uniqueReleases.has(release.id)
      uniqueReleases.add(release.id)
      return !isDuplicate
    })
  })

  // Sort by date
  const array = Array.from(merged.values())
  const sortedArray = array.sort((a, b) => new Date(a.date) - new Date(b.date))
  return sortedArray
}

export const flattenReleases = (data) => {
  return data.flatMap((yearItem) =>
    yearItem.releases.flatMap((monthItem) =>
      monthItem.releases.flatMap((dayItem) => {
        // Construct the full date string
        const day = dayItem.day >= 10 ? dayItem.day : '0' + dayItem.day // Add 0-padding
        let month = parseInt(monthItem.month) + 1 // From the API -> January is 0, Dec is 11
        month = month >= 10 ? month : '0' + month // Add 0-padding
        const fullDate = `${yearItem.year}-${month}-${day}`

        // eslint-disable-next-line max-nested-callbacks
        const releases = dayItem.releases.map((release) => ({
          id: release.id,
          name: release.name,
          type: release.type,
          mainSubject: release.mainSubject,
          url: release.statisticsPageUrl || release.upcomingReleaseLink || '',
          variant: release.variant,
        }))

        return {
          date: fullDate,
          releases,
        }
      })
    )
  )
}

export const flattenContentReleases = (contentReleases) => {
  const releases = []

  contentReleases.forEach((item) => {
    const date = item.date.split('T')[0] // Get date, ignore rest
    const newReleaseItem = {
      id: item.id,
      name: item.name,
      type: item.type,
      mainSubject: item.mainSubject,
      url: item.upcomingReleaseLink,
    }

    const existing = releases.find((release) => new Date(release.date).toISOString().split('T')[0] === date)

    if (existing) {
      existing.releases.push(newReleaseItem)
    } else {
      const newReleaseDay = { date: date, releases: [] }
      newReleaseDay.releases.push(newReleaseItem)
      releases.push(newReleaseDay)
    }
  })
  return releases
}

const getLastReleaseDateInArray = (releases) => {
  const sorted = releases.sort((a, b) => a.date - b.date)
  const lastDate = sorted[releases.length - 1].date.split('-')
  return {
    year: lastDate[0],
    month: lastDate[1],
    day: lastDate[2],
  }
}

function renderRelease(release, index, date, statisticsPageUrlText) {
  const { type, name, variant, mainSubject, url, upcomingReleaseLink } = release
  const { day, monthName, year } = date
  const showPeriod = type === 'statistikk' || type === 'statistic'

  return (
    <li key={index} className='mb-3'>
      <div>
        {!upcomingReleaseLink && <span className='sr-only'>{`${name} - ${showPeriod ? variant.period : ''}`}</span>}

        {upcomingReleaseLink ? (
          // deepcode ignore DOMXSS: URL is sanitized in the backend
          <Link href={upcomingReleaseLink} linkType='header'>
            {name}
          </Link>
        ) : (
          <h3 className='mb-0' aria-hidden='true'>
            {name}
          </h3>
        )}

        {showPeriod && (
          <p className='mb-0' aria-hidden='true'>
            {variant.period}
          </p>
        )}
        <p className='metadata' aria-hidden='true'>
          {day}. {monthName} {year} / <span className='type'>{type}</span> / {mainSubject}
        </p>
      </div>

      {url && (
        <div className='statisticsPageLink'>
          <Link href={url}>{statisticsPageUrlText}</Link>
        </div>
      )}
    </li>
  )
}

function getShortMonthName(monthNumber, language) {
  const monthName = getMonthName(monthNumber, language).slice(0, 3)
  if (monthName === 'may' || monthName === 'mai') {
    return monthName
  }
  return monthName + '.'
}
function getMonthName(monthNumber, language) {
  const monthNames =
    language === 'en'
      ? [
          'january',
          'february',
          'march',
          'april',
          'may',
          'june',
          'july',
          'august',
          'september',
          'october',
          'november',
          'december',
        ]
      : [
          'januar',
          'februar',
          'mars',
          'april',
          'mai',
          'juni',
          'juli',
          'august',
          'september',
          'oktober',
          'november',
          'desember',
        ]
  return monthNames[monthNumber]
}

function UpcomingReleases(props) {
  const [releases, setReleases] = useState(
    mergeAndSortReleases(flattenReleases(props.releases), flattenContentReleases(props.contentReleases))
  )
  const [loading, setLoading] = useState(false)
  const [showAll, setShowAll] = useState(false)

  function fetchAllReleases() {
    const lastCountedDay = getLastReleaseDateInArray(releases)
    setLoading(true)
    setShowAll(true)
    axios
      .get(props.upcomingReleasesServiceUrl, {
        params: {
          start: `${lastCountedDay.year}-${parseInt(lastCountedDay.month)}-${parseInt(lastCountedDay.day)}`,
          showAll: true,
          language: props.language,
        },
      })
      .then((res) => {
        if (res.data.releases.length) {
          const newReleases = mergeAndSortReleases(releases, flattenReleases(res.data.releases))
          setReleases(newReleases)
        } else {
          setLoading(true)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  function renderDay(dayWithReleases, language, isFirst, statisticsPageUrlText) {
    const date = new Date(dayWithReleases.date)
    const releaseDate = {
      day: date.getDate(),
      monthName: getShortMonthName(date.getMonth(), language),
      year: date.getFullYear(),
    }
    const day = date.getDate()
    const month = date.getMonth()

    return (
      <div className={`calendar-day ${isFirst ? 'first' : ''}`} key={day.date}>
        <time aria-hidden='true' dateTime={date.toISOString()}>
          <span className='day'>{day}</span>
          <span className='month'>{getShortMonthName(month, language)}</span>
        </time>
        <span id={`datemonth-${day.date}`} className='sr-only' aria-hidden='true'>{`${day}. ${getShortMonthName(
          month,
          language
        )}`}</span>
        <ol className='releaseList' aria-labelledby={`heading-upcoming-releases datemonth-${day.date}`}>
          {dayWithReleases.releases.map((release, releaseIndex) =>
            renderRelease(release, releaseIndex, releaseDate, statisticsPageUrlText)
          )}
        </ol>
      </div>
    )
  }

  function renderButton() {
    if (loading) {
      return (
        <div className='text-center'>
          <span className='spinner-border spinner-border' />
        </div>
      )
    } else {
      return (
        <Button className='button-more' disabled={loading || showAll} onClick={fetchAllReleases}>
          <ChevronDown size='18' />
          {props.buttonTitle}
        </Button>
      )
    }
  }

  function renderList(releases, statisticsPageUrlText) {
    const list = releases.map((day) => renderDay(day, props.language, false, statisticsPageUrlText))
    return list
  }

  return (
    <section className='nextStatisticsReleases container-fluid p-0'>
      <div className='row extended-banner'>
        <div className='col-12 upcoming-releases-head px-4'>
          <div className='container py-5'>
            <h1 id='heading-upcoming-releases'>{props.title ? props.title : undefined}</h1>
            <div
              className='upcoming-releases-ingress'
              dangerouslySetInnerHTML={{
                __html: props.preface.replace(/&nbsp;/g, ' '),
              }}
            ></div>
          </div>
        </div>
        <div className='col-12 release-list px-4'>
          <div className='container mt-5'>
            <div className='row d-flex justify-content-center'>
              <div className='col-12 p-0'>
                {renderList(releases, props.statisticsPageUrlText)}
                {renderButton()}
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
  releases: PropTypes.arrayOf(
    PropTypes.shape({
      year: PropTypes.string,
      releases: PropTypes.arrayOf(
        PropTypes.shape({
          month: PropTypes.string,
          monthName: PropTypes.string,
          releases: PropTypes.arrayOf(
            PropTypes.shape({
              day: PropTypes.string,
              releases: PropTypes.arrayOf(
                PropTypes.shape({
                  date: PropTypes.shape({
                    day: PropTypes.string,
                    month: PropTypes.string,
                    year: PropTypes.string,
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
                        nextRelease: PropTypes.string,
                      },
                      statisticsPageUrl: PropTypes.string,
                    })
                  ),
                })
              ),
            })
          ),
        })
      ),
    })
  ),
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
      statisticsPageUrl: PropTypes.string,
    })
  ),
}

export default (props) => <UpcomingReleases {...props} />
