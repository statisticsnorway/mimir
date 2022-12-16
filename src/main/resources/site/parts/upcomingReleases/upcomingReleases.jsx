import React, { useState } from 'react'
import { Button, Link } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import axios from 'axios'
import { ChevronDown } from 'react-feather'

function UpcomingReleases(props) {
  const [releases, setReleases] = useState(props.releases)
  const [loading, setLoading] = useState(false)
  const [showAll, setShowAll] = useState(false)

  function fetchAllReleases() {
    setLoading(true)
    setShowAll(true)
    axios
      .get(props.upcomingReleasesServiceUrl, {
        params: {
          start: 0,
          language: props.language,
        },
      })
      .then((res) => {
        if (res.data.releases.length) {
          setReleases(res.data.releases)
        } else {
          setLoading(true)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  function renderRelease(release, index, date) {
    const { type, name, variant, mainSubject, statisticsPageUrl, upcomingReleaseLink } = release
    const { day, monthName, year } = date
    const statisticsPageUrlText = props.statisticsPageUrlText
    const showPeriod = type === 'Statistikk' || type === 'Statistic'

    return (
      <li key={index} className='mb-3'>
        <div>
          {!upcomingReleaseLink && <span className='sr-only'>{`${name} - ${showPeriod ? variant.period : ''}`}</span>}

          {upcomingReleaseLink ? (
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
        {statisticsPageUrl && (
          <div className='statisticsPageLink'>
            <Link href={statisticsPageUrl}>{statisticsPageUrlText}</Link>
          </div>
        )}
      </li>
    )
  }

  function renderDay(day, month, year, index) {
    const date = {
      day: day.day,
      monthName: month.monthName,
      month: month.month,
      year: year.year,
    }

    const monthNumber = Number(month.month)
    const monthPadded = monthNumber < 9 ? '0' + (monthNumber + 1) : monthNumber + 1
    const dateTime = `${year.year}-${monthPadded}-${day.day}`

    const monthNames =
      props.language === 'en'
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
    const monthNameLong = monthNames[monthNumber]

    return (
      <div className={`calendar-day ${index === 0 ? 'first' : ''}`} key={index}>
        <time aria-hidden='true' dateTime={dateTime}>
          <span className='day'>{day.day}</span>
          <span className='month'>{month.monthName}</span>
        </time>
        <span
          id={`datemonth-${monthNumber}${index}`}
          className='sr-only'
          aria-hidden='true'
        >{`${day.day}. ${monthNameLong}`}</span>
        <ol className='releaseList' aria-labelledby={`heading-upcoming-releases datemonth-${monthNumber}${index}`}>
          {day.releases.map((release, releaseIndex) => renderRelease(release, releaseIndex, date))}
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

  function renderList() {
    const list = releases.map((year) => {
      return year.releases.map((month) => {
        return month.releases.map((day, index) => {
          return renderDay(day, month, year, index)
        })
      })
    })
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
                {renderList()}
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
                      id: PropTypes.string,
                      name: PropTypes.string,
                      type: PropTypes.string,
                      mainSubject: PropTypes.string,
                      variants: {
                        id: PropTypes.string,
                        day: PropTypes.number,
                        monthNumber: PropTypes.number,
                        year: PropTypes.number,
                        period: PropTypes.string,
                        frequency: PropTypes.string,
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
}

export default (props) => <UpcomingReleases {...props} />
