import React from 'react'
import { Link, Paragraph, Title } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

const months = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des']

class ReleasedStatistics extends React.Component {
  constructor(props) {
    super(props)
  }

  renderDayWithReleases(currentDay, currentDate, indexes) {
    const currentDayReversed = currentDay.reverse()
    return (
      <article className={indexes.dayIndex === 0 && 'first'} key={`${indexes.yearIndex}-${indexes.monthIndex}-${indexes.dayIndex}`}>
        <time dateTime={`${currentDate.year}-${currentDate.month}-${currentDate.day}`}>
          <span className='day'>{currentDate.day}</span>
          <span className='month'>{months[currentDate.month]}</span>
        </time>
        <ol className='releaseList'>
          {currentDayReversed.map((release, index) => {
            return (
              <li key={index}>
                <Link href={`/${release.shortName}`} linkType='header'>{release.name}</Link>
                <Paragraph>{release.variant.period}</Paragraph>
              </li>
            )
          })}
        </ol>
      </article>
    )
  }

  render() {
    return (<section className='nextStatisticsReleases'>
      <Title size={3}>this.props.title</Title>
      {
        Object.keys(this.props.releases).reverse().map((year, yearIndex) => {
          const currentYear = this.props.releases[year]
          return Object.keys(currentYear).reverse().map((month, monthIndex) => {
            const currentMonth = currentYear[month]
            return Object.keys(currentMonth).reverse().map((day, dayIndex) => {
              return this.renderDayWithReleases( currentMonth[day], {
                year,
                month,
                day
              }, {
                dayIndex,
                monthIndex,
                yearIndex
              })
            })
          })
        })}
    </section>)
  }
}

ReleasedStatistics.propTypes = {
  title: PropTypes.string,
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
}

export default (props) => <ReleasedStatistics {...props}/>
