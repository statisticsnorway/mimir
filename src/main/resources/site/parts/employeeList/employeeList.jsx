import React from 'react'
import PropTypes from 'prop-types'
import { Link, Divider, Text, LeadParagraph } from '@statisticsnorway/ssb-component-library'
import { ArrowRight } from 'react-feather'

function EmployeeList(props) {
  const {
    researchers, total, pageTitle, pageDescription
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

  const createListItems = (list) => {
    return list.record.map((researcher, i) => {
      return (
        <>
          <li className="list-item" role="listitem">
            {letterBlock(i, list.alphabet)}
            <div className="researcher-info">
              {researcherDetails(researcher)}
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
          <h1 className="page-title">{pageTitle}</h1>
          <div className="page-description" dangerouslySetInnerHTML={{ __html: pageDescription }}></div>
        </div>
      </div>
      <div className="row">
        <div className="container">
          <div className="mb-3"><p>Det er {total} personer i avdelingen</p></div>
          {researchers != [] ? renderResearchers() : null}
        </div>
      </div>
    </section>
  )
}

export default (props) => <EmployeeList {...props} />

EmployeeList.propTypes = {
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
  pageTitle: PropTypes.string,
  pageDescription: PropTypes.string
}
