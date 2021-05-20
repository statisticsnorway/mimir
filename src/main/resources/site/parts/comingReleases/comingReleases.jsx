import React from 'react'
import { Link, Paragraph, Title } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

class ComingReleases extends React.Component {
  constructor(props) {
    super(props)
  }

  renderRelease(release, index) {
    return (
      <li key={index}>
        <Link href={`/${release.shortName}`} linkType='header'>{release.name}</Link>
        <Paragraph>{release.variant.period}</Paragraph>
      </li>
    )
  }

  renderDay(day, month, year, index) {
    return (
      <article className={index === 0 && 'first'} key={index}>
        <time dateTime={`${year}-${month.month}`}>
          <span className='day'>{day.day}</span>
          <span className='month'>{month.monthName}</span>
        </time>
        <ol className='releaseList'>
          {
            day.releases.map((release, releaseIndex) => this.renderRelease(release, releaseIndex))
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
