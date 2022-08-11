import React from 'react'
import { Link } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

class ReleasedStatistics extends React.Component {
  constructor(props) {
    super(props)
  }

  renderRelease(release, index) {
    const hrefStatistic = this.props.language === 'en' ? `/en/${release.shortName}` : `/${release.shortName}`
    return (
      <li key={index} className="front-page-released-statistic">
        <Link href={hrefStatistic} linkType='header' ariaLabel={`${release.name} - ${release.variant.period}`}>
          {release.name}
        </Link>
        <p className="my-2" aria-hidden="true">{release.variant.period}</p>
      </li>
    )
  }

  renderDay(day, month, year, index) {
    const monthNumber = Number(month.month)
    const monthPadded = monthNumber < 9 ? '0' + (monthNumber + 1) : monthNumber + 1
    const dateTime = `${day.day}.${monthPadded}.${year.year}`
    const monthNames = this.props.language === 'en' ?
      ['january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'] :
      ['januar', 'februar', 'mars', 'april', 'mai', 'juni',
        'juli', 'august', 'september', 'oktober', 'november', 'desember']
    const monthNameLong = monthNames[monthNumber]

    return (
      <div className={`calendar-day ${index === 0 && 'first'}`} key={index}>
        <time aria-hidden="true" dateTime={dateTime}>
          <span className='day'>{day.day}</span>
          <span className='month'>{month.monthName}</span>
        </time>
        <span id={`datemonth-${monthNumber}${index}`} aria-hidden="true" className="sr-only">{`${day.day}. ${monthNameLong}`}</span>
        <ol className='releaseList' aria-labelledby={`heading-released-statistics datemonth-${monthNumber}${index}`}>
          
          {
            day.releases.map((release, releaseIndex) => this.renderRelease(release, releaseIndex))
          }
        </ol>
      </div>
    )
  }

  render() {
    return (
      <section className='nextStatisticsReleases container-fluid'>
        <h2 className="mb-4" id="heading-released-statistics">{this.props.title}</h2>
        {
          this.props.releases.reverse().map((year) => {
            return year.releases.reverse().map((month) => {
              return month.releases.reverse().map((day, index) => this.renderDay(day, month, year, index))
            })
          })
        }
      </section>
    )
  }
}

ReleasedStatistics.propTypes = {
  title: PropTypes.string,
  language: PropTypes.string,
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

export default (props) => <ReleasedStatistics {...props}/>
