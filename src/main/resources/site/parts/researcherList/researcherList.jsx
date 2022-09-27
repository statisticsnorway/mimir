import React from 'react'
import PropTypes from 'prop-types'
import { Button, Title, Link, LeadParagraph, Paragraph, Accordion } from '@statisticsnorway/ssb-component-library'


function ResearcherList(props) {
  const { title, researchers } = props
  console.log(researchers)

  const groupedCollection = {};

  const sortAlphabetically = (obj) => {
    return Object.keys(obj)
      .sort()
      .reduce((accumulator, key) => {
        accumulator[key] = obj[key];

    return accumulator;
  }, {});

  }

  for (let i = 0; i < researchers.length; i++) {       
    let firstLetter = researchers[i].surname.charAt(0);
    
    if (groupedCollection[firstLetter] == undefined) {             
      groupedCollection[firstLetter] = [];         
    }         
    groupedCollection[firstLetter].push(researchers[i]);     
  }

  const renderResearchers = () => {
    let html = []
    const sortedGroupCollection = sortAlphabetically(groupedCollection)
    for (const [letter, researchersList] of Object.entries(sortedGroupCollection)) {

      let box = researchersList.map((researcher, i) => {
        return (
          <li className={`${i === 0 ? 'first' : ''}`} >
            <Link href={researcher._path} linkType="header">{researcher.surname}, {researcher.name}</Link>
            {researcher.position ? <p>{researcher.position}</p> : null}
            <p>{researcher.phone} / {researcher.email} / Forskningsområde</p> 
          </li>
        )
      })

      html.push(
        <div className="letter-list">
          <div className="letter"><h2>{letter}</h2></div>
          <ul className="list">{box}</ul>
        </div>
      )
    }

    return (
      <div>
        {html}
      </div>
    ) 
  }

  return (
    <section className="xp-part employee container p-0 mb-5">
      {researchers != [] ? renderResearchers() : null}
    </section>
  )
}

export default (props) => <ResearcherList {...props} />

ResearcherList.propTypes = {
  title: PropTypes.string,
  researchers: PropTypes.array
}
