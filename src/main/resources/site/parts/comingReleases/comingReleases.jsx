import React from 'react'
import { Link, Paragraph, Title } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

class ComingReleases extends React.Component {
  constructor(props) {
    super(props)
  }

  renderRelease(release, index, date) {
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

  renderDay(day, month, year, index) {
    const date = {
      day: day.day,
      monthName: month.monthName,
      year: year.year
    }
    return (
      <article className={index === 0 && 'first'} key={index}>
        <time dateTime={`${year}-${month.month}`}>
          <span className='day'>{day.day}</span>
          <span className='month'>{month.monthName}</span>
        </time>
        <ol className='releaseList'>
          {
            day.releases.map((release, releaseIndex) => this.renderRelease(release, releaseIndex, date))
          }
        </ol>
      </article>
    )
  }

  render() {
    return (
      <section className='nextStatisticsReleases'>
        <Title size={2}>{this.props.title}</Title>
        {
          this.props.releases.map((year) => {
            return year.releases.map((month) => {
              return month.releases.map((day, index) => this.renderDay(day, month, year, index))
            })
          })
        }
      </section>
    )
  }
}

ComingReleases.propTypes = {
  title: PropTypes.string,
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
