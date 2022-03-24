import React from 'react'
import { Link, Paragraph } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

class ReleasedStatistics extends React.Component {
  constructor(props) {
    super(props)
  }

  renderRelease(release, index) {
    const hrefStatistic = this.props.language === 'en' ? `/en/${release.shortName}` : `/${release.shortName}`
    return (
      <li key={index} className="front-page-released-statistic">
        <Link href={hrefStatistic} linkType='header'>{release.name}</Link>
        <Paragraph className="my-2">{release.variant.period}</Paragraph>
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
    const releasePhrase = this.props.language === 'en' ? 'Releases' : 'Publiseringer'

    return (
      <li className={`calendar-day ${index === 0 && 'first'}`} key={index} aria-labelledby={`heading-released-statistics datemonth-${index}`}>
        <span id={`datemonth-${index}`} className="sr-only">{`${releasePhrase} ${day.day}. ${monthNameLong}`}</span>
        <time dateTime={dateTime}>
          <span className='day' aria-hidden="true">{day.day}</span>
          <span className='month' aria-hidden="true">{month.monthName}</span>
        </time>
        <ol className='releaseList'>
          {
            day.releases.map((release, releaseIndex) => this.renderRelease(release, releaseIndex))
          }
        </ol>
      </li>
    )
  }

  render() {
    return (
      <section className='nextStatisticsReleases'>
        <h2 className="mb-4" id="heading-released-statistics">{this.props.title}</h2>
        <ol>
          {
            this.props.releases.reverse().map((year) => {
              return year.releases.reverse().map((month) => {
                return month.releases.reverse().map((day, index) => this.renderDay(day, month, year, index))
              })
            })
          }
        </ol>
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
