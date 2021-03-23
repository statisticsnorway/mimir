import React from 'react'
import { Link, Paragraph, Title } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

class NextStatisticReleases extends React.Component {
  constructor(props) {
    super(...props)
  }
  render() {
    return (<section className='nextStatisticsReleases'>
      <Title size={3}>Ny statistikk</Title>
      {this.releases.map((release, relaseIndex) => {
        return (
          <article key={relaseIndex}>
            <time dateTime='2021-08-11'>
              <span className='day'>{release.date.day}</span>
              <span className='month'>{release.date.month}</span>
            </time>
            <ol className='releaseList first'>
              <li>
                <Link linkType='header'>Omsetning i varehandel</Link>
                <Paragraph>Tall for 2. termin</Paragraph>
              </li>
            </ol>
          </article>
        )
      })}
    </section>)
  }
}

NextStatisticReleases.propTypes = {
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

export default (props) => <NextStatisticReleases {...props}/>
