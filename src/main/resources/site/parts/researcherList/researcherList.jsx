import React from 'react'
import PropTypes from 'prop-types'
import { Link, Divider, Text, LeadParagraph } from '@statisticsnorway/ssb-component-library'
import { ArrowRight } from 'react-feather'

function ResearcherList(props) {
  const {
    researchers, total, pageHeadingPhrase, pageDescriptionPhrase
  } = props

  const sortResearchersWithinLetter = (listByLetter) => {
    return listByLetter.sort((a, b) => a.surname.localeCompare(b.surname))
  }

  const renderResearchers = () => {
    const ListOfResearchersJSX = []

    for (const [letter, researchersListByLetter] of Object.entries(researchers)) {
      const sortedResearchersWithinLetter = sortResearchersWithinLetter(researchersListByLetter)

      const researchersListItem = sortedResearchersWithinLetter.map((researcher, i) => {
        return (
          <>
            <li className="list-item" role="listitem">
              {i == 0 ? <div className="letter"><h2>{letter}</h2></div> : <div className="empty-letter"></div>}
              <div className="researcher-info">
                <div>
                  <Link href={researcher.path} linkType="header">{researcher.surname}, {researcher.name}</Link>
                  {researcher.position ? <div className="position"><Text small>{researcher.position}</Text></div> : null}
                  <div className="contact-details">
                    <Text small>
                      {researcher.phone != '' ? <><Link href={'tel:' + researcher.phone}>{researcher.phone}</Link><span> / </span> </> : null}
                      {researcher.email != '' ? <><Link href={'mailto:' + researcher.email}>{researcher.email}</Link><span> / </span> </> : null}
                      {researcher.area.title != '' ? researcher.area.title : null}
                    </Text>
                  </div>
                </div>
                <div className="list-arrow">
                  <Link href={researcher.path} icon={<ArrowRight size="30" />} title={'link to ' + researcher.name}></Link>
                </div>
              </div>
            </li>
            <Divider light />
          </>
        )
      })

      ListOfResearchersJSX.push(
        <ul className="letter-list" aria-label={letter}>{researchersListItem}</ul>
      )
    }

    return (
      <div>
        <Divider dark />
        {ListOfResearchersJSX}
      </div>
    )
  }

  return (
    <section className="xp-part researchers p-0 mb-5">
      <div className="row banner">
        <div className="container">
          <h1>{pageHeadingPhrase}</h1>
          <LeadParagraph>{pageDescriptionPhrase}</LeadParagraph>
        </div>
      </div>
      <div className="row">
        <div className="container">
          <div className="mb-3"><p>Det er {total} personer i Forskningsavdelingen</p></div>
          {researchers != [] ? renderResearchers() : null}
        </div>
      </div>
    </section>
  )
}

export default (props) => <ResearcherList {...props} />

ResearcherList.propTypes = {
  researchers: PropTypes.object,
  total: PropTypes.number,
  pageHeadingPhrase: PropTypes.string,
  pageDescriptionPhrase: PropTypes.string
}
