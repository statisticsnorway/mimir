import React from 'react'
import PropTypes from 'prop-types'
import { Link, Divider, Text, LeadParagraph } from '@statisticsnorway/ssb-component-library'
import { ArrowRight } from 'react-feather'

function ResearcherList(props) {
  const {
    researchers, total, pageHeadingPhrase, pageDescriptionPhrase
  } = props

  const letterBlock = (index, alphabetLetter) => {
    return (
      <>
        {index == 0 ? <div className="letter"><h2>{alphabetLetter}</h2></div> : <div className="empty-letter"></div>}
      </>
    )
  }

  const researcherDetails = (researcher) => {
    return (
      <div>
        <Link href={researcher.path} linkType="header">{researcher.surname}, {researcher.name}</Link>
        {researcher.position ? <div className="position"><Text small>{researcher.position}</Text></div> : null}
        <div className="contact-details">
          <Text small>
            {researcher.phone != '' ? <><Link href={'tel:' + researcher.phone}>{researcher.phone}</Link><span> / </span> </> : null}
            {researcher.email != '' ? <><Link href={'mailto:' + researcher.email}>{researcher.email}</Link></> : null}
            {researcher.area.title == undefined || researcher.email == '' ? null : <span> / </span>}
            {researcher.area.title != '' ? researcher.area.title : null}
          </Text>
        </div>
      </div>
    )
  }

  const arrowLink = (href, name) => {
    return (
      <div className="list-arrow">
        <Link href={href} icon={<ArrowRight size="30" />} title={'link to ' + name}></Link>
      </div>
    )
  }

  const createListItems = (list) => {
    return list.record.map((researcher, i) => {
      return (
        <>
          <li className="list-item" role="listitem">
            {letterBlock(i, list.alphabet)}
            <div className="researcher-info">
              {researcherDetails(researcher)}
              {arrowLink(researcher.path, researcher.name)}
            </div>
          </li>
          <Divider light />
        </>
      )
    })
  }

  const renderResearchers = () => {
    const listItems = researchers.map((researchersByLetter) => {
      return createListItems(researchersByLetter)
    })

    return (
      <div>
        <Divider dark />
        <ul className="letter-list">
          {listItems}
        </ul>
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
  researchers: PropTypes.arrayOf(
    PropTypes.shape({
      surname: PropTypes.string,
      name: PropTypes.string,
      position: PropTypes.string,
      path: PropTypes.string,
      phone: PropTypes.string,
      email: PropTypes.string,
      area: PropTypes.string
    }),
  ),
  total: PropTypes.number,
  pageHeadingPhrase: PropTypes.string,
  pageDescriptionPhrase: PropTypes.string
}
